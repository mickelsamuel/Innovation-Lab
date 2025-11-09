import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from './storage.service';
import { FileType, FileUploadResponseDto } from './dto/upload-file.dto';

/**
 * Files service for managing file uploads
 */
@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  // File size limits (in bytes)
  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
  private readonly MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB
  private readonly MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

  // Allowed mimetypes
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];
  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];

  constructor(
    private prisma: PrismaService,
    private storage: StorageService
  ) {}

  /**
   * Upload a file
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    type: FileType = FileType.DOCUMENT,
    entityId?: string,
    entityType?: string
  ): Promise<FileUploadResponseDto> {
    // Validate file
    this.validateFile(file, type);

    // Determine folder based on type
    const folder = this.getFolderByType(type);

    try {
      // Upload to storage
      const uploadResult = await this.storage.uploadFile(file, folder);

      // Save metadata to database
      const fileRecord = await this.prisma.file.create({
        data: {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          key: uploadResult.key,
          url: uploadResult.url,
          type,
          uploadedById: userId,
          entityId,
          entityType,
        },
      });

      this.logger.log(`File uploaded: ${fileRecord.id} by user ${userId}`);

      return {
        id: fileRecord.id,
        filename: fileRecord.filename,
        mimetype: fileRecord.mimetype,
        size: fileRecord.size,
        url: fileRecord.url,
        key: fileRecord.key,
        type: fileRecord.type as FileType,
        uploadedAt: fileRecord.createdAt.toISOString(),
      };
    } catch (error) {
      this.logger.error('File upload failed:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(id: string): Promise<FileUploadResponseDto> {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return {
      id: file.id,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: file.url,
      key: file.key,
      type: file.type as FileType,
      uploadedAt: file.createdAt.toISOString(),
    };
  }

  /**
   * Get files by entity
   */
  async getFilesByEntity(
    entityType: string,
    entityId: string
  ): Promise<FileUploadResponseDto[]> {
    const files = await this.prisma.file.findMany({
      where: {
        entityType,
        entityId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return files.map((file) => ({
      id: file.id,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: file.url,
      key: file.key,
      type: file.type as FileType,
      uploadedAt: file.createdAt.toISOString(),
    }));
  }

  /**
   * Delete file
   */
  async deleteFile(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check permissions
    if (!isAdmin && file.uploadedById !== userId) {
      throw new ForbiddenException('You can only delete your own files');
    }

    if (file.deletedAt) {
      throw new BadRequestException('File already deleted');
    }

    try {
      // Soft delete in database
      await this.prisma.file.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // Delete from storage (async, don't wait)
      this.storage.deleteFile(file.key).catch((error) => {
        this.logger.error(`Failed to delete file from storage: ${file.key}`, error);
      });

      this.logger.log(`File deleted: ${id} by user ${userId}`);
    } catch (error) {
      this.logger.error('File deletion failed:', error);
      throw new BadRequestException('Failed to delete file');
    }
  }

  /**
   * Validate file based on type
   */
  private validateFile(file: Express.Multer.File, type: FileType): void {
    let maxSize: number;
    let allowedTypes: string[];

    switch (type) {
      case FileType.IMAGE:
        maxSize = this.MAX_IMAGE_SIZE;
        allowedTypes = this.ALLOWED_IMAGE_TYPES;
        break;
      case FileType.VIDEO:
        maxSize = this.MAX_VIDEO_SIZE;
        allowedTypes = this.ALLOWED_VIDEO_TYPES;
        break;
      case FileType.DOCUMENT:
        maxSize = this.MAX_DOCUMENT_SIZE;
        allowedTypes = this.ALLOWED_DOCUMENT_TYPES;
        break;
      case FileType.AVATAR:
        maxSize = this.MAX_AVATAR_SIZE;
        allowedTypes = this.ALLOWED_IMAGE_TYPES;
        break;
      default:
        throw new BadRequestException('Invalid file type');
    }

    // Check file size
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.formatBytes(maxSize)}`
      );
    }

    // Check mimetype
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed for ${type}`
      );
    }
  }

  /**
   * Get folder name by file type
   */
  private getFolderByType(type: FileType): string {
    switch (type) {
      case FileType.IMAGE:
        return 'images';
      case FileType.VIDEO:
        return 'videos';
      case FileType.DOCUMENT:
        return 'documents';
      case FileType.AVATAR:
        return 'avatars';
      default:
        return 'files';
    }
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
