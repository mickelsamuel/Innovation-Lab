import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import {
  FileUploadResponseDto,
  UploadFileQueryDto,
  FileType,
} from './dto/upload-file.dto';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Upload a file
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request (invalid file)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: UploadFileQueryDto,
    @Req() req: any
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const userId = req.user.id;
    const { type = FileType.DOCUMENT, entityId, entityType } = query;

    return this.filesService.uploadFile(file, userId, type, entityId, entityType);
  }

  /**
   * Get file by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata by ID' })
  @ApiResponse({
    status: 200,
    description: 'File metadata retrieved',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFile(@Param('id') id: string): Promise<FileUploadResponseDto> {
    return this.filesService.getFileById(id);
  }

  /**
   * Get files by entity
   */
  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get all files for an entity' })
  @ApiResponse({
    status: 200,
    description: 'Files retrieved',
    type: [FileUploadResponseDto],
  })
  async getFilesByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string
  ): Promise<FileUploadResponseDto[]> {
    return this.filesService.getFilesByEntity(entityType, entityId);
  }

  /**
   * Delete file
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden (not owner)' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('id') id: string, @Req() req: any): Promise<{ message: string }> {
    const userId = req.user.id;
    const isAdmin =
      req.user.role === Role.BANK_ADMIN;

    await this.filesService.deleteFile(id, userId, isAdmin);

    return { message: 'File deleted successfully' };
  }

  /**
   * Serve local files (development only)
   */
  @Get('serve/*')
  @ApiOperation({ summary: 'Serve local file (development only)' })
  async serveFile(@Param('0') filePath: string, @Res() res: Response): Promise<void> {
    const uploadsDir = process.env.LOCAL_STORAGE_PATH || './uploads';
    const fullPath = path.join(uploadsDir, filePath);

    // Security check - ensure path is within uploads directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadsDir = path.resolve(uploadsDir);

    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    res.sendFile(fullPath);
  }
}
