'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  File as FileIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Download,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { getFilesByEntity, deleteFile, formatFileSize, type FileUploadResponse } from '@/lib/files';
import { cn } from '@/lib/utils';
import { getAuthToken } from '@/lib/api';

interface FileListProps {
  entityType: string;
  entityId: string;
  canDelete?: boolean;
  showEmpty?: boolean;
  className?: string;
  onDelete?: (file: FileUploadResponse) => void;
}

export function FileList({
  entityType,
  entityId,
  canDelete = false,
  showEmpty = true,
  className,
  onDelete,
}: FileListProps) {
  const [files, setFiles] = useState<FileUploadResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFiles();
  }, [entityType, entityId]);

  async function fetchFiles() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getFilesByEntity(entityType, entityId);
      setFiles(data);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : String(err) || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(file: FileUploadResponse) {
    if (!confirm(`Delete ${file.filename}?`)) return;

    try {
      setDeletingIds(prev => new Set(prev).add(file.id));

      const token = getAuthToken();
      if (!token) {
        alert('Please login to delete files');
        return;
      }

      await deleteFile(file.id, token);
      setFiles(prev => prev.filter(f => f.id !== file.id));
      onDelete?.(file);
    } catch (err) {
      console.error('Error deleting file:', err);
      alert(err instanceof Error ? err.message : String(err) || 'Failed to delete file');
    } finally {
      setDeletingIds(prev => {
        const updated = new Set(prev);
        updated.delete(file.id);
        return updated;
      });
    }
  }

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5" />;
    }
    if (mimetype.startsWith('video/')) {
      return <VideoIcon className="w-5 h-5" />;
    }
    return <FileIcon className="w-5 h-5" />;
  };

  const getFilePreview = (file: FileUploadResponse) => {
    if (file.mimetype.startsWith('image/')) {
      return (
        <div className="relative w-12 h-12 rounded overflow-hidden bg-slate-100">
          <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
        </div>
      );
    }

    return (
      <Avatar className="w-12 h-12">
        <AvatarFallback className="bg-slate-100 text-slate-600">
          {getFileIcon(file.mimetype)}
        </AvatarFallback>
      </Avatar>
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-600">Loading files...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-sm text-red-600 mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchFiles}>
          Try Again
        </Button>
      </div>
    );
  }

  // Empty State
  if (files.length === 0 && !showEmpty) {
    return null;
  }

  if (files.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <FileIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-600">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-slate-700 mb-3">
        {files.length} file{files.length !== 1 ? 's' : ''}
      </p>

      {files.map(file => {
        const isDeleting = deletingIds.has(file.id);

        return (
          <Card key={file.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {getFilePreview(file)}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{file.filename}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>

                  <a href={file.url} download={file.filename} className="inline-flex">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>

                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(file)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
