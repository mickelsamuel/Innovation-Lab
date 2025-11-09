import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * Supported file types for upload
 */
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AVATAR = 'avatar',
}

/**
 * File upload response
 */
export class FileUploadResponseDto {
  @ApiProperty({ description: 'Unique file ID' })
  id: string;

  @ApiProperty({ description: 'Original filename' })
  filename: string;

  @ApiProperty({ description: 'File mimetype' })
  mimetype: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiProperty({ description: 'Public URL to access the file' })
  url: string;

  @ApiProperty({ description: 'S3 key/path' })
  key: string;

  @ApiProperty({ description: 'File type category', enum: FileType })
  type: FileType;

  @ApiProperty({ description: 'Upload timestamp' })
  uploadedAt: string;
}

/**
 * Query DTO for file upload
 */
export class UploadFileQueryDto {
  @ApiProperty({
    description: 'Type of file being uploaded',
    enum: FileType,
    required: false,
  })
  @IsEnum(FileType)
  @IsOptional()
  type?: FileType = FileType.DOCUMENT;

  @ApiProperty({
    description: 'Entity ID to associate file with (e.g., submissionId, userId)',
    required: false,
  })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiProperty({
    description: 'Entity type (e.g., submission, user, hackathon)',
    required: false,
  })
  @IsString()
  @IsOptional()
  entityType?: string;
}
