import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileList } from './file-list';
import { FileType, type FileUploadResponse } from '@/lib/files';

const mockFiles: FileUploadResponse[] = [
  {
    id: '1',
    filename: 'test-file.pdf',
    url: 'https://example.com/test-file.pdf',
    size: 1024,
    mimetype: 'application/pdf',
    type: FileType.DOCUMENT,
    key: 'file-key-1',
    uploadedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    filename: 'test-image.jpg',
    url: 'https://example.com/test-image.jpg',
    size: 2048,
    mimetype: 'image/jpeg',
    type: FileType.IMAGE,
    key: 'file-key-2',
    uploadedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    filename: 'test-video.mp4',
    url: 'https://example.com/test-video.mp4',
    size: 5120,
    mimetype: 'video/mp4',
    type: FileType.VIDEO,
    key: 'file-key-3',
    uploadedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock file operations
vi.mock('@/lib/files', () => ({
  getFilesByEntity: vi.fn(),
  deleteFile: vi.fn(),
  formatFileSize: vi.fn(size => `${size} bytes`),
}));

vi.mock('@/lib/api', () => ({
  getAuthToken: vi.fn(() => 'fake-token'),
}));

import { getFilesByEntity, deleteFile } from '@/lib/files';
import { getAuthToken } from '@/lib/api';

describe('FileList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFilesByEntity).mockResolvedValue(mockFiles);
  });

  it('should show loading state initially', () => {
    render(<FileList entityType="hackathon" entityId="1" />);
    expect(screen.getByText('Loading files...')).toBeInTheDocument();
  });

  it('should render files after loading', async () => {
    render(<FileList entityType="hackathon" entityId="1" />);

    await waitFor(() => {
      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
    });

    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
  });

  it('should display file count', async () => {
    render(<FileList entityType="hackathon" entityId="1" />);

    await waitFor(() => {
      expect(screen.getByText('3 files')).toBeInTheDocument();
    });
  });

  it('should render empty state when no files', async () => {
    vi.mocked(getFilesByEntity).mockResolvedValue([]);
    render(<FileList entityType="hackathon" entityId="1" />);

    await waitFor(() => {
      expect(screen.getByText('No files uploaded yet')).toBeInTheDocument();
    });
  });

  it('should not render empty state when showEmpty is false', async () => {
    vi.mocked(getFilesByEntity).mockResolvedValue([]);
    const { container } = render(
      <FileList entityType="hackathon" entityId="1" showEmpty={false} />
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should show error state on fetch failure', async () => {
    vi.mocked(getFilesByEntity).mockRejectedValue(new Error('Failed to fetch'));
    render(<FileList entityType="hackathon" entityId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('should show try again button on error', async () => {
    vi.mocked(getFilesByEntity).mockRejectedValue(new Error('Failed to fetch'));
    render(<FileList entityType="hackathon" entityId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should render download links', async () => {
    render(<FileList entityType="hackathon" entityId="1" />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it('should show delete button when canDelete is true', async () => {
    render(<FileList entityType="hackathon" entityId="1" canDelete={true} />);

    await waitFor(() => {
      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button');
    // 3 files × 3 buttons each (external, download, delete) = 9 buttons
    expect(deleteButtons.length).toBe(9);
  });

  it('should not show delete button when canDelete is false', async () => {
    render(<FileList entityType="hackathon" entityId="1" canDelete={false} />);

    await waitFor(() => {
      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
    });

    // Count buttons - should only have download and external link buttons (2 per file)
    const buttons = screen.getAllByRole('button');
    // Each file has 2 buttons (external link + download), so 3 files = 6 buttons total
    expect(buttons).toHaveLength(6);
  });

  it('should call confirm before deleting', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<FileList entityType="hackathon" entityId="1" canDelete={true} />);

    await waitFor(() => {
      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
    });

    // Find delete buttons - they're the last button in each file row
    const buttons = screen.getAllByRole('button');
    // Each file has 3 buttons (external, download, delete), so last button of first file is buttons[2]
    const deleteButton = buttons[2];

    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('should display file size', async () => {
    render(<FileList entityType="hackathon" entityId="1" />);

    await waitFor(() => {
      expect(screen.getByText(/1024 bytes/)).toBeInTheDocument();
      expect(screen.getByText(/2048 bytes/)).toBeInTheDocument();
    });
  });

  it('should apply custom className', async () => {
    vi.mocked(getFilesByEntity).mockResolvedValue([]);
    const { container } = render(
      <FileList entityType="hackathon" entityId="1" className="custom-class" />
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  it('should render image preview for image files', async () => {
    const imageFile = [
      {
        id: '1',
        filename: 'image.jpg',
        url: 'https://example.com/image.jpg',
        size: 1024,
        mimetype: 'image/jpeg',
        type: FileType.IMAGE,
        key: 'key-1',
        uploadedAt: '2024-01-01T00:00:00Z',
      },
    ];
    vi.mocked(getFilesByEntity).mockResolvedValue(imageFile);

    render(<FileList entityType="hackathon" entityId="1" />);

    await waitFor(() => {
      expect(screen.getByText('image.jpg')).toBeInTheDocument();
    });

    // Image preview should be rendered
    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  it('should render video icon for video files', async () => {
    const videoFile = [
      {
        id: '1',
        filename: 'video.mp4',
        url: 'https://example.com/video.mp4',
        size: 5120,
        mimetype: 'video/mp4',
        type: FileType.VIDEO,
        key: 'key-1',
        uploadedAt: '2024-01-01T00:00:00Z',
      },
    ];
    vi.mocked(getFilesByEntity).mockResolvedValue(videoFile);

    render(<FileList entityType="hackathon" entityId="1" />);

    await waitFor(() => {
      expect(screen.getByText('video.mp4')).toBeInTheDocument();
    });
  });

  it('should show alert when trying to delete without token', async () => {
    const user = userEvent.setup();
    global.confirm = vi.fn(() => true);
    global.alert = vi.fn();
    vi.mocked(getAuthToken).mockReturnValue(null);

    render(<FileList entityType="hackathon" entityId="1" canDelete={true} />);

    await waitFor(() => {
      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    // Each file has 3 buttons (external, download, delete), first file's delete is buttons[2]
    const deleteButton = buttons[2];

    await user.click(deleteButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Please login to delete files');
    });
  });

  it('should handle delete error', async () => {
    const user = userEvent.setup();
    global.confirm = vi.fn(() => true);
    global.alert = vi.fn();
    vi.mocked(getAuthToken).mockReturnValue('token');
    vi.mocked(deleteFile).mockRejectedValue(new Error('Delete failed'));

    render(<FileList entityType="hackathon" entityId="1" canDelete={true} />);

    await waitFor(() => {
      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    // Each file has 3 buttons (external, download, delete), first file's delete is buttons[2]
    const deleteButton = buttons[2];

    await user.click(deleteButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Delete failed');
    });
  });
});
