import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from './storage.service';
import { FileType } from './dto/upload-file.dto';

describe('FilesService', () => {
  let service: FilesService;
  let prisma: PrismaService;
  let storage: StorageService;

  const mockPrismaService = {
    file: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    prisma = module.get<PrismaService>(PrismaService);
    storage = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    const validFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024 * 1024, // 1MB
    } as Express.Multer.File;

    it('should upload a document file', async () => {
      const uploadResult = { key: 'test-key', url: 'http://example.com/test.pdf' };
      const fileRecord = {
        id: 'file-1',
        filename: validFile.originalname,
        mimetype: validFile.mimetype,
        size: validFile.size,
        key: uploadResult.key,
        url: uploadResult.url,
        type: FileType.DOCUMENT,
        createdAt: new Date(),
      };

      mockStorageService.uploadFile.mockResolvedValue(uploadResult);
      mockPrismaService.file.create.mockResolvedValue(fileRecord);

      const result = await service.uploadFile(validFile, 'user-1', FileType.DOCUMENT);

      expect(result).toEqual({
        id: fileRecord.id,
        filename: fileRecord.filename,
        mimetype: fileRecord.mimetype,
        size: fileRecord.size,
        url: fileRecord.url,
        key: fileRecord.key,
        type: fileRecord.type,
        uploadedAt: fileRecord.createdAt.toISOString(),
      });
      expect(storage.uploadFile).toHaveBeenCalledWith(validFile, 'documents');
      expect(prisma.file.create).toHaveBeenCalled();
    });

    it('should upload an image file', async () => {
      const imageFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 2 * 1024 * 1024, // 2MB
      } as Express.Multer.File;
      const uploadResult = { key: 'test-key', url: 'http://example.com/test.jpg' };
      const fileRecord = {
        id: 'file-1',
        filename: imageFile.originalname,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
        key: uploadResult.key,
        url: uploadResult.url,
        type: FileType.IMAGE,
        createdAt: new Date(),
      };

      mockStorageService.uploadFile.mockResolvedValue(uploadResult);
      mockPrismaService.file.create.mockResolvedValue(fileRecord);

      const result = await service.uploadFile(imageFile, 'user-1', FileType.IMAGE);

      expect(result.type).toBe(FileType.IMAGE);
      expect(storage.uploadFile).toHaveBeenCalledWith(imageFile, 'images');
    });

    it('should throw BadRequestException for oversized file', async () => {
      const oversizedFile = {
        originalname: 'large.pdf',
        mimetype: 'application/pdf',
        size: 50 * 1024 * 1024, // 50MB (exceeds 25MB limit for documents)
      } as Express.Multer.File;

      await expect(
        service.uploadFile(oversizedFile, 'user-1', FileType.DOCUMENT)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid mimetype', async () => {
      const invalidFile = {
        originalname: 'test.exe',
        mimetype: 'application/x-msdownload',
        size: 1024,
      } as Express.Multer.File;

      await expect(
        service.uploadFile(invalidFile, 'user-1', FileType.DOCUMENT)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when upload fails', async () => {
      mockStorageService.uploadFile.mockRejectedValue(new Error('Storage error'));

      await expect(
        service.uploadFile(validFile, 'user-1', FileType.DOCUMENT)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getFileById', () => {
    it('should return file by ID', async () => {
      const file = {
        id: 'file-1',
        filename: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        url: 'http://example.com/test.pdf',
        key: 'test-key',
        type: FileType.DOCUMENT,
        createdAt: new Date(),
      };
      mockPrismaService.file.findUnique.mockResolvedValue(file);

      const result = await service.getFileById('file-1');

      expect(result).toEqual({
        id: file.id,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: file.url,
        key: file.key,
        type: file.type,
        uploadedAt: file.createdAt.toISOString(),
      });
    });

    it('should throw NotFoundException when file not found', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(null);

      await expect(service.getFileById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFilesByEntity', () => {
    it('should return files for entity', async () => {
      const files = [
        {
          id: 'file-1',
          filename: 'test1.pdf',
          mimetype: 'application/pdf',
          size: 1024,
          url: 'http://example.com/test1.pdf',
          key: 'test-key-1',
          type: FileType.DOCUMENT,
          createdAt: new Date(),
        },
        {
          id: 'file-2',
          filename: 'test2.pdf',
          mimetype: 'application/pdf',
          size: 2048,
          url: 'http://example.com/test2.pdf',
          key: 'test-key-2',
          type: FileType.DOCUMENT,
          createdAt: new Date(),
        },
      ];
      mockPrismaService.file.findMany.mockResolvedValue(files);

      const result = await service.getFilesByEntity('SUBMISSION', 'entity-1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('file-1');
      expect(prisma.file.findMany).toHaveBeenCalledWith({
        where: {
          entityType: 'SUBMISSION',
          entityId: 'entity-1',
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when no files found', async () => {
      mockPrismaService.file.findMany.mockResolvedValue([]);

      const result = await service.getFilesByEntity('SUBMISSION', 'entity-1');

      expect(result).toEqual([]);
    });
  });

  describe('deleteFile', () => {
    const file = {
      id: 'file-1',
      filename: 'test.pdf',
      key: 'test-key',
      uploadedById: 'user-1',
      deletedAt: null,
    };

    it('should delete file as owner', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(file);
      mockPrismaService.file.update.mockResolvedValue({ ...file, deletedAt: new Date() });
      mockStorageService.deleteFile.mockResolvedValue(undefined);

      await service.deleteFile('file-1', 'user-1', false);

      expect(prisma.file.update).toHaveBeenCalledWith({
        where: { id: 'file-1' },
        data: { deletedAt: expect.any(Date) },
      });
      expect(storage.deleteFile).toHaveBeenCalledWith('test-key');
    });

    it('should delete file as admin', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(file);
      mockPrismaService.file.update.mockResolvedValue({ ...file, deletedAt: new Date() });
      mockStorageService.deleteFile.mockResolvedValue(undefined);

      await service.deleteFile('file-1', 'admin-1', true);

      expect(prisma.file.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when file not found', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(null);

      await expect(service.deleteFile('file-1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(file);

      await expect(service.deleteFile('file-1', 'user-2', false)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw BadRequestException when file already deleted', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue({
        ...file,
        deletedAt: new Date(),
      });

      await expect(service.deleteFile('file-1', 'user-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when deletion fails', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(file);
      mockPrismaService.file.update.mockRejectedValue(new Error('DB error'));

      await expect(service.deleteFile('file-1', 'user-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
