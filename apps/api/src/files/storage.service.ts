import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);
const mkdir = util.promisify(fs.mkdir);

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

/**
 * Storage service for handling file uploads
 * Supports both S3 (production) and local storage (development)
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: AWS.S3 | null = null;
  private bucketName: string;
  private region: string;
  private useS3: boolean;
  private localStoragePath: string;
  private cdnUrl: string;

  constructor(private configService: ConfigService) {
    this.useS3 = this.configService.get<string>('STORAGE_TYPE') === 's3';
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET', 'innovation-lab');
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.localStoragePath = this.configService.get<string>(
      'LOCAL_STORAGE_PATH',
      './uploads'
    );
    this.cdnUrl = this.configService.get<string>('CDN_URL', '');

    if (this.useS3) {
      this.initializeS3();
    } else {
      this.initializeLocalStorage();
    }
  }

  /**
   * Initialize S3 client
   */
  private initializeS3() {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'AWS credentials not found. Falling back to local storage.'
      );
      this.useS3 = false;
      this.initializeLocalStorage();
      return;
    }

    this.s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region: this.region,
    });

    this.logger.log(`S3 Storage initialized with bucket: ${this.bucketName}`);
  }

  /**
   * Initialize local storage directory
   */
  private async initializeLocalStorage() {
    try {
      if (!fs.existsSync(this.localStoragePath)) {
        await mkdir(this.localStoragePath, { recursive: true });
      }
      this.logger.log(
        `Local storage initialized at: ${this.localStoragePath}`
      );
    } catch (error) {
      this.logger.error('Failed to initialize local storage:', error);
    }
  }

  /**
   * Upload a file
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'files'
  ): Promise<UploadResult> {
    const fileId = randomUUID();
    const ext = path.extname(file.originalname);
    const key = `${folder}/${fileId}${ext}`;

    if (this.useS3 && this.s3) {
      return this.uploadToS3(file, key);
    } else {
      return this.uploadToLocal(file, key);
    }
  }

  /**
   * Upload to S3
   */
  private async uploadToS3(
    file: Express.Multer.File,
    key: string
  ): Promise<UploadResult> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      await this.s3!.putObject(params).promise();

      const url = this.cdnUrl
        ? `${this.cdnUrl}/${key}`
        : `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded to S3: ${key}`);

      return {
        key,
        url,
        size: file.size,
      };
    } catch (error) {
      this.logger.error('S3 upload failed:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Upload to local storage
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    key: string
  ): Promise<UploadResult> {
    try {
      const filePath = path.join(this.localStoragePath, key);
      const directory = path.dirname(filePath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(directory)) {
        await mkdir(directory, { recursive: true });
      }

      await writeFile(filePath, file.buffer);

      const baseUrl = this.configService.get<string>(
        'API_URL',
        'http://localhost:4000'
      );
      const url = `${baseUrl}/v1/files/${key}`;

      this.logger.log(`File uploaded locally: ${key}`);

      return {
        key,
        url,
        size: file.size,
      };
    } catch (error) {
      this.logger.error('Local upload failed:', error);
      throw new Error('Failed to upload file locally');
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(key: string): Promise<void> {
    if (this.useS3 && this.s3) {
      return this.deleteFromS3(key);
    } else {
      return this.deleteFromLocal(key);
    }
  }

  /**
   * Delete from S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    try {
      await this.s3!
        .deleteObject({
          Bucket: this.bucketName,
          Key: key,
        })
        .promise();

      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error('S3 delete failed:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  /**
   * Delete from local storage
   */
  private async deleteFromLocal(key: string): Promise<void> {
    try {
      const filePath = path.join(this.localStoragePath, key);
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
        this.logger.log(`File deleted locally: ${key}`);
      }
    } catch (error) {
      this.logger.error('Local delete failed:', error);
      throw new Error('Failed to delete file locally');
    }
  }

  /**
   * Get signed URL for private files (S3 only)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.useS3 && this.s3) {
      return this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn,
      });
    } else {
      // For local storage, return direct URL
      const baseUrl = this.configService.get<string>(
        'API_URL',
        'http://localhost:4000'
      );
      return `${baseUrl}/v1/files/${key}`;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    if (this.useS3 && this.s3) {
      try {
        await this.s3.headObject({
          Bucket: this.bucketName,
          Key: key,
        }).promise();
        return true;
      } catch {
        return false;
      }
    } else {
      const filePath = path.join(this.localStoragePath, key);
      return fs.existsSync(filePath);
    }
  }
}
