'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  X,
  File as FileIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  uploadFile,
  formatFileSize,
  validateFileSize,
  validateFileType,
  FileType,
  type FileUploadResponse,
} from '@/lib/files';
import { cn } from '@/lib/utils';
import { getAuthToken } from '@/lib/api';

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  fileType?: FileType;
  entityId?: string;
  entityType?: string;
  onUploadComplete?: (files: FileUploadResponse[]) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  result?: FileUploadResponse;
}

export function FileUpload({
  accept = '*/*',
  maxSizeMB = 25,
  maxFiles = 10,
  fileType = FileType.DOCUMENT,
  entityId,
  entityType,
  onUploadComplete,
  onUploadError,
  className,
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get allowed types from accept prop
  const allowedTypes = accept === '*/*' ? [] : accept.split(',').map(t => t.trim());

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      // Convert FileList to array
      const fileArray = Array.from(files);

      // Validate file count
      if (uploadingFiles.length + fileArray.length > maxFiles) {
        onUploadError?.(new Error(`Maximum ${maxFiles} files allowed`));
        return;
      }

      // Validate each file
      const validFiles: File[] = [];
      for (const file of fileArray) {
        // Check size
        if (!validateFileSize(file, maxSizeMB)) {
          onUploadError?.(new Error(`${file.name} exceeds ${maxSizeMB}MB limit`));
          continue;
        }

        // Check type
        if (allowedTypes.length > 0 && !validateFileType(file, allowedTypes)) {
          onUploadError?.(new Error(`${file.name} is not an allowed file type`));
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      // Initialize uploading files
      const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
        file,
        progress: 0,
        status: 'uploading' as const,
      }));

      setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

      // Upload files
      const results: FileUploadResponse[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileIndex = uploadingFiles.length + i;

        try {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Please login to upload files');
          }

          const result = await uploadFile(file, token, {
            type: fileType,
            entityId,
            entityType,
            onProgress: progress => {
              setUploadingFiles(prev => {
                const updated = [...prev];
                updated[fileIndex] = { ...updated[fileIndex], progress };
                return updated;
              });
            },
          });

          results.push(result);

          // Update status to success
          setUploadingFiles(prev => {
            const updated = [...prev];
            updated[fileIndex] = {
              ...updated[fileIndex],
              status: 'success',
              progress: 100,
              result,
            };
            return updated;
          });
        } catch (error: any) {
          // Update status to error
          setUploadingFiles(prev => {
            const updated = [...prev];
            updated[fileIndex] = {
              ...updated[fileIndex],
              status: 'error',
              error: error.message || 'Upload failed',
            };
            return updated;
          });

          onUploadError?.(error);
        }
      }

      if (results.length > 0) {
        onUploadComplete?.(results);
      }
    },
    [
      uploadingFiles,
      maxFiles,
      maxSizeMB,
      allowedTypes,
      fileType,
      entityId,
      entityType,
      onUploadComplete,
      onUploadError,
    ]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input
      e.target.value = '';
    },
    [handleFiles]
  );

  const removeFile = useCallback((index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploadingFiles(prev => prev.filter(f => f.status === 'uploading'));
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-6 h-6" />;
    if (file.type.startsWith('video/')) return <VideoIcon className="w-6 h-6" />;
    return <FileIcon className="w-6 h-6" />;
  };

  const hasCompleted = uploadingFiles.some(f => f.status === 'success' || f.status === 'error');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary/50'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="pt-10 pb-10 text-center">
          <Upload
            className={cn('w-12 h-12 mx-auto mb-4', isDragging ? 'text-primary' : 'text-slate-400')}
          />
          <p className="text-base font-medium text-slate-700 mb-1">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-sm text-slate-500">
            {allowedTypes.length > 0 && `Accepted: ${accept} • `}
            Max {maxSizeMB}MB per file • Up to {maxFiles} files
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              {uploadingFiles.length} file{uploadingFiles.length !== 1 ? 's' : ''}
            </p>
            {hasCompleted && (
              <Button variant="ghost" size="sm" onClick={clearCompleted}>
                Clear Completed
              </Button>
            )}
          </div>

          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-slate-500">
                    {getFileIcon(uploadingFile.file)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {uploadingFile.file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(uploadingFile.file.size)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {uploadingFile.status === 'uploading' && (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        )}
                        {uploadingFile.status === 'success' && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {uploadingFile.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {uploadingFile.status === 'uploading' && (
                      <Progress value={uploadingFile.progress} className="h-2" />
                    )}

                    {uploadingFile.status === 'success' && (
                      <p className="text-xs text-green-600">Upload complete</p>
                    )}

                    {uploadingFile.status === 'error' && (
                      <p className="text-xs text-red-600">{uploadingFile.error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
