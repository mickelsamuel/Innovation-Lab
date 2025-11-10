import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  FileType,
  formatFileSize,
  getFileTypeFromMime,
  validateFileSize,
  validateFileType,
  uploadFile,
  getFileById,
  getFilesByEntity,
  deleteFile,
} from './files';

// Mock apiFetch
vi.mock('./api', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from './api';

describe('Files Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('getFileTypeFromMime', () => {
    it('should detect image types', () => {
      expect(getFileTypeFromMime('image/jpeg')).toBe(FileType.IMAGE);
      expect(getFileTypeFromMime('image/png')).toBe(FileType.IMAGE);
      expect(getFileTypeFromMime('image/gif')).toBe(FileType.IMAGE);
    });

    it('should detect video types', () => {
      expect(getFileTypeFromMime('video/mp4')).toBe(FileType.VIDEO);
      expect(getFileTypeFromMime('video/webm')).toBe(FileType.VIDEO);
    });

    it('should default to document type', () => {
      expect(getFileTypeFromMime('application/pdf')).toBe(FileType.DOCUMENT);
      expect(getFileTypeFromMime('text/plain')).toBe(FileType.DOCUMENT);
      expect(getFileTypeFromMime('application/json')).toBe(FileType.DOCUMENT);
    });
  });

  describe('validateFileSize', () => {
    it('should accept files within size limit', () => {
      const file = new File(['a'.repeat(1024)], 'test.txt', { type: 'text/plain' });
      expect(validateFileSize(file, 1)).toBe(true);
    });

    it('should reject files exceeding size limit', () => {
      const file = new File(['a'.repeat(2 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
      expect(validateFileSize(file, 1)).toBe(false);
    });

    it('should accept files exactly at size limit', () => {
      const oneMB = new File(['a'.repeat(1024 * 1024)], 'exact.txt', { type: 'text/plain' });
      expect(validateFileSize(oneMB, 1)).toBe(true);
    });
  });

  describe('validateFileType', () => {
    const imageFile = new File([''], 'image.jpg', { type: 'image/jpeg' });
    const pdfFile = new File([''], 'doc.pdf', { type: 'application/pdf' });
    const videoFile = new File([''], 'video.mp4', { type: 'video/mp4' });

    it('should accept exact MIME type match', () => {
      expect(validateFileType(imageFile, ['image/jpeg'])).toBe(true);
      expect(validateFileType(pdfFile, ['application/pdf'])).toBe(true);
    });

    it('should accept wildcard MIME type match', () => {
      expect(validateFileType(imageFile, ['image/*'])).toBe(true);
      expect(validateFileType(videoFile, ['video/*'])).toBe(true);
    });

    it('should reject non-matching MIME types', () => {
      expect(validateFileType(imageFile, ['application/pdf'])).toBe(false);
      expect(validateFileType(pdfFile, ['image/*'])).toBe(false);
    });

    it('should match against multiple allowed types', () => {
      expect(validateFileType(imageFile, ['image/*', 'video/*'])).toBe(true);
      expect(validateFileType(videoFile, ['image/*', 'video/*'])).toBe(true);
    });
  });

  describe('getFileById', () => {
    it('should call apiFetch with correct endpoint', async () => {
      const mockFile = { id: '123', filename: 'test.jpg' };
      vi.mocked(apiFetch).mockResolvedValue(mockFile);

      const result = await getFileById('123');

      expect(apiFetch).toHaveBeenCalledWith('/files/123');
      expect(result).toEqual(mockFile);
    });
  });

  describe('getFilesByEntity', () => {
    it('should call apiFetch with correct endpoint', async () => {
      const mockFiles = [{ id: '1', filename: 'file1.jpg' }];
      vi.mocked(apiFetch).mockResolvedValue(mockFiles);

      const result = await getFilesByEntity('hackathon', 'hack-123');

      expect(apiFetch).toHaveBeenCalledWith('/files/entity/hackathon/hack-123');
      expect(result).toEqual(mockFiles);
    });
  });

  describe('deleteFile', () => {
    it('should call apiFetch with DELETE method and token', async () => {
      vi.mocked(apiFetch).mockResolvedValue(undefined);

      await deleteFile('file-123', 'token-456');

      expect(apiFetch).toHaveBeenCalledWith('/files/file-123', {
        method: 'DELETE',
        token: 'token-456',
      });
    });
  });

  describe('uploadFile', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should upload file without progress tracking', async () => {
      const mockResponse = { id: '123', filename: 'test.jpg', url: 'https://example.com/test.jpg' };
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadFile(file, 'token-123');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should include query parameters', async () => {
      const mockResponse = { id: '123', filename: 'test.jpg' };
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      await uploadFile(file, 'token-123', {
        type: FileType.IMAGE,
        entityId: 'entity-456',
        entityType: 'hackathon',
      });

      const calls = vi.mocked(global.fetch).mock.calls;
      const url = calls[0][0] as string;
      expect(url).toContain('type=image');
      expect(url).toContain('entityId=entity-456');
      expect(url).toContain('entityType=hackathon');
    });

    it('should handle upload error', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Upload failed' }),
      } as Response);

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      await expect(uploadFile(file, 'token-123')).rejects.toThrow('Upload failed');
    });

    it('should handle upload error without message', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      await expect(uploadFile(file, 'token-123')).rejects.toThrow('Upload failed');
    });

    it('should track upload progress using XMLHttpRequest', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const progressCallback = vi.fn();
      const mockResponse = { id: '123', filename: 'test.jpg' };

      // Mock XMLHttpRequest
      const mockXHR = {
        upload: {
          addEventListener: vi.fn(),
        },
        addEventListener: vi.fn(),
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(),
        status: 200,
        responseText: JSON.stringify(mockResponse),
      };

      global.XMLHttpRequest = vi.fn(() => mockXHR) as unknown as typeof XMLHttpRequest;

      const uploadPromise = uploadFile(file, 'token-123', {
        onProgress: progressCallback,
      });

      // Simulate progress event
      const progressHandler = mockXHR.upload.addEventListener.mock.calls.find(
        call => call[0] === 'progress'
      )?.[1];

      if (progressHandler) {
        progressHandler({ lengthComputable: true, loaded: 50, total: 100 } as ProgressEvent);
      }

      // Simulate load event
      const loadHandler = mockXHR.addEventListener.mock.calls.find(call => call[0] === 'load')?.[1];

      if (loadHandler) {
        loadHandler();
      }

      const result = await uploadPromise;

      expect(result).toEqual(mockResponse);
      expect(progressCallback).toHaveBeenCalledWith(50);
      expect(mockXHR.open).toHaveBeenCalledWith('POST', expect.stringContaining('/files/upload'));
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer token-123');
    });

    it('should handle progress with non-computable length', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const progressCallback = vi.fn();
      const mockResponse = { id: '123', filename: 'test.jpg' };

      const mockXHR = {
        upload: {
          addEventListener: vi.fn(),
        },
        addEventListener: vi.fn(),
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(),
        status: 200,
        responseText: JSON.stringify(mockResponse),
      };

      global.XMLHttpRequest = vi.fn(() => mockXHR) as unknown as typeof XMLHttpRequest;

      const uploadPromise = uploadFile(file, 'token-123', {
        onProgress: progressCallback,
      });

      // Simulate progress event with non-computable length
      const progressHandler = mockXHR.upload.addEventListener.mock.calls.find(
        call => call[0] === 'progress'
      )?.[1];

      if (progressHandler) {
        progressHandler({ lengthComputable: false, loaded: 50, total: 100 } as ProgressEvent);
      }

      // Simulate load event
      const loadHandler = mockXHR.addEventListener.mock.calls.find(call => call[0] === 'load')?.[1];

      if (loadHandler) {
        loadHandler();
      }

      await uploadPromise;

      expect(progressCallback).not.toHaveBeenCalled();
    });

    it('should handle XMLHttpRequest upload error', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const progressCallback = vi.fn();

      const mockXHR = {
        upload: {
          addEventListener: vi.fn(),
        },
        addEventListener: vi.fn(),
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(),
      };

      global.XMLHttpRequest = vi.fn(() => mockXHR) as unknown as typeof XMLHttpRequest;

      const uploadPromise = uploadFile(file, 'token-123', {
        onProgress: progressCallback,
      });

      // Simulate error event
      const errorHandler = mockXHR.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      if (errorHandler) {
        errorHandler();
      }

      await expect(uploadPromise).rejects.toThrow('Network error');
    });

    it('should handle XMLHttpRequest non-200 status', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const progressCallback = vi.fn();

      const mockXHR = {
        upload: {
          addEventListener: vi.fn(),
        },
        addEventListener: vi.fn(),
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(),
        status: 400,
        responseText: JSON.stringify({ message: 'Bad request' }),
      };

      global.XMLHttpRequest = vi.fn(() => mockXHR) as unknown as typeof XMLHttpRequest;

      const uploadPromise = uploadFile(file, 'token-123', {
        onProgress: progressCallback,
      });

      // Simulate load event with error status
      const loadHandler = mockXHR.addEventListener.mock.calls.find(call => call[0] === 'load')?.[1];

      if (loadHandler) {
        loadHandler();
      }

      await expect(uploadPromise).rejects.toThrow('Bad request');
    });

    it('should handle XMLHttpRequest with invalid JSON response', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const progressCallback = vi.fn();

      const mockXHR = {
        upload: {
          addEventListener: vi.fn(),
        },
        addEventListener: vi.fn(),
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(),
        status: 200,
        responseText: 'Invalid JSON',
      };

      global.XMLHttpRequest = vi.fn(() => mockXHR) as unknown as typeof XMLHttpRequest;

      const uploadPromise = uploadFile(file, 'token-123', {
        onProgress: progressCallback,
      });

      // Simulate load event
      const loadHandler = mockXHR.addEventListener.mock.calls.find(call => call[0] === 'load')?.[1];

      if (loadHandler) {
        loadHandler();
      }

      await expect(uploadPromise).rejects.toThrow('Invalid JSON response');
    });

    it('should handle XMLHttpRequest error status with invalid JSON', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const progressCallback = vi.fn();

      const mockXHR = {
        upload: {
          addEventListener: vi.fn(),
        },
        addEventListener: vi.fn(),
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(),
        status: 500,
        responseText: 'Invalid JSON',
      };

      global.XMLHttpRequest = vi.fn(() => mockXHR) as unknown as typeof XMLHttpRequest;

      const uploadPromise = uploadFile(file, 'token-123', {
        onProgress: progressCallback,
      });

      // Simulate load event with error status
      const loadHandler = mockXHR.addEventListener.mock.calls.find(call => call[0] === 'load')?.[1];

      if (loadHandler) {
        loadHandler();
      }

      await expect(uploadPromise).rejects.toThrow('Upload failed');
    });
  });
});
