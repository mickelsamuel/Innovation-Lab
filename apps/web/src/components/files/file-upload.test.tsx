import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileUpload } from './file-upload';

// Mock file operations
vi.mock('@/lib/files', () => ({
  uploadFile: vi.fn(),
  formatFileSize: vi.fn(size => `${size} bytes`),
  validateFileSize: vi.fn(() => true),
  validateFileType: vi.fn(() => true),
  FileType: {
    DOCUMENT: 'DOCUMENT',
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
  },
}));

vi.mock('@/lib/api', () => ({
  getAuthToken: vi.fn(() => 'fake-token'),
}));

import { uploadFile, validateFileSize, validateFileType } from '@/lib/files';

describe('FileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(uploadFile).mockResolvedValue({
      id: '123',
      filename: 'test.jpg',
      url: 'https://example.com/test.jpg',
      size: 1024,
      mimetype: 'image/jpeg',
      type: 'IMAGE',
      key: 'key-123',
      uploadedAt: '2024-01-01T00:00:00Z',
    });
    vi.mocked(validateFileSize).mockReturnValue(true);
    vi.mocked(validateFileType).mockReturnValue(true);
  });

  it('should render upload dropzone', () => {
    render(<FileUpload />);
    expect(screen.getByText(/drag and drop files here/i)).toBeInTheDocument();
  });

  it('should display max file size information', () => {
    render(<FileUpload maxSizeMB={25} />);
    expect(screen.getByText(/max 25mb per file/i)).toBeInTheDocument();
  });

  it('should display max files information', () => {
    render(<FileUpload maxFiles={10} />);
    expect(screen.getByText(/up to 10 files/i)).toBeInTheDocument();
  });

  it('should display accepted file types when specified', () => {
    render(<FileUpload accept=".pdf,.doc" />);
    expect(screen.getByText(/accepted:.*.pdf,.doc/i)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<FileUpload className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render file input element', () => {
    const { container } = render(<FileUpload />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('should handle drag enter event', () => {
    const { container } = render(<FileUpload />);
    const dropzone = container.querySelector('[class*="border-dashed"]');

    fireEvent.dragEnter(dropzone!, { dataTransfer: { files: [] } });
    expect(dropzone).toHaveClass('border-primary');
  });

  it('should handle drag leave event', () => {
    const { container } = render(<FileUpload />);
    const dropzone = container.querySelector('[class*="border-dashed"]');

    fireEvent.dragEnter(dropzone!, { dataTransfer: { files: [] } });
    fireEvent.dragLeave(dropzone!, { dataTransfer: { files: [] } });
    expect(dropzone).not.toHaveClass('border-primary');
  });

  it('should handle drag over event', () => {
    const { container } = render(<FileUpload />);
    const dropzone = container.querySelector('[class*="border-dashed"]');

    const event = fireEvent.dragOver(dropzone!, { dataTransfer: { files: [] } });
    expect(event).toBeDefined();
  });

  it('should upload file on drop', async () => {
    const onUploadComplete = vi.fn();
    const { container } = render(<FileUpload onUploadComplete={onUploadComplete} />);
    const dropzone = container.querySelector('[class*="border-dashed"]');

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalled();
    });
  });

  it('should call onUploadError when file exceeds size limit', async () => {
    vi.mocked(validateFileSize).mockReturnValue(false);
    const onUploadError = vi.fn();
    const { container } = render(<FileUpload maxSizeMB={1} onUploadError={onUploadError} />);
    const dropzone = container.querySelector('[class*="border-dashed"]');

    const file = new File(['a'.repeat(2 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(onUploadError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('should call onUploadError when file type not allowed', async () => {
    vi.mocked(validateFileType).mockReturnValue(false);
    const onUploadError = vi.fn();
    const { container } = render(<FileUpload accept="image/*" onUploadError={onUploadError} />);
    const dropzone = container.querySelector('[class*="border-dashed"]');

    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(onUploadError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('should reject when exceeding max files limit', async () => {
    const onUploadError = vi.fn();
    const { container } = render(<FileUpload maxFiles={1} onUploadError={onUploadError} />);
    const dropzone = container.querySelector('[class*="border-dashed"]');

    const files = [
      new File(['content1'], 'file1.jpg', { type: 'image/jpeg' }),
      new File(['content2'], 'file2.jpg', { type: 'image/jpeg' }),
    ];
    fireEvent.drop(dropzone!, {
      dataTransfer: { files },
    });

    await waitFor(() => {
      expect(onUploadError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Maximum 1 files allowed'),
        })
      );
    });
  });

  it('should show file being uploaded', async () => {
    const { container } = render(<FileUpload />);
    const dropzone = container.querySelector('[class*="border-dashed"]');

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  it('should show clear completed button after upload', async () => {
    const { container } = render(<FileUpload />);
    const dropzone = container.querySelector('[class*="border-dashed"]');

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('Clear Completed')).toBeInTheDocument();
    });
  });

  it('should remove file when remove button clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload />);
    const dropzone = container.querySelector('[class*="border-dashed"]');

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find(btn => btn.querySelector('svg'));
    if (removeButton) {
      await user.click(removeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
    });
  });

  it('should show upload error', async () => {
    vi.mocked(uploadFile).mockRejectedValue(new Error('Upload failed'));
    const { container } = render(<FileUpload />);
    const dropzone = container.querySelector('[class*="border-dashed"]');

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/Upload failed/)).toBeInTheDocument();
    });
  });
});
