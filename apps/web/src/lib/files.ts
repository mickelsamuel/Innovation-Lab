/**
 * File upload API client functions
 */

import { apiFetch } from './api';

export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AVATAR = 'avatar',
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  key: string;
  type: FileType;
  uploadedAt: string;
}

export interface UploadFileOptions {
  type?: FileType;
  entityId?: string;
  entityType?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Upload a file
 */
export async function uploadFile(
  file: File,
  token: string,
  options: UploadFileOptions = {}
): Promise<FileUploadResponse> {
  const { type = FileType.DOCUMENT, entityId, entityType, onProgress } = options;

  const formData = new FormData();
  formData.append('file', file);

  // Build query params
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (entityId) params.append('entityId', entityId);
  if (entityType) params.append('entityType', entityType);

  const queryString = params.toString();
  const url = `/files/upload${queryString ? `?${queryString}` : ''}`;

  // Use XMLHttpRequest for progress tracking
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(
              new Error(error instanceof Error ? error.message : String(error) || 'Upload failed')
            );
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}${url}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  // Regular fetch for no progress tracking
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}${url}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error instanceof Error ? error.message : String(error) || 'Upload failed');
  }

  return response.json();
}

/**
 * Get file by ID
 */
export async function getFileById(id: string): Promise<FileUploadResponse> {
  return apiFetch<FileUploadResponse>(`/files/${id}`);
}

/**
 * Get files by entity
 */
export async function getFilesByEntity(
  entityType: string,
  entityId: string
): Promise<FileUploadResponse[]> {
  return apiFetch<FileUploadResponse[]>(`/files/entity/${entityType}/${entityId}`);
}

/**
 * Delete file
 */
export async function deleteFile(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/files/${id}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file type from MIME type
 */
export function getFileTypeFromMime(mimetype: string): FileType {
  if (mimetype.startsWith('image/')) return FileType.IMAGE;
  if (mimetype.startsWith('video/')) return FileType.VIDEO;
  return FileType.DOCUMENT;
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const prefix = type.replace('/*', '');
      return file.type.startsWith(prefix);
    }
    return file.type === type;
  });
}
