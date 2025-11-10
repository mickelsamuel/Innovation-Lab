import { render, screen, waitFor } from '../../../test/utils/custom-render';
import { JudgeAssignment } from './JudgeAssignment';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignJudge, removeJudge } from '@/lib/judging';
import { getAuthToken } from '@/lib/api';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/lib/judging', () => ({
  assignJudge: vi.fn(),
  removeJudge: vi.fn(),
  getJudges: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  getAuthToken: vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

global.fetch = vi.fn();
global.confirm = vi.fn();

describe('JudgeAssignment', () => {
  const mockOnUpdate = vi.fn();
  const mockJudges = [
    {
      id: 'judge-1',
      userId: 'user-1',
      user: {
        id: 'user-1',
        name: 'Judge One',
        email: 'judge1@example.com',
        handle: 'judge1',
        avatarUrl: null,
        roles: ['JUDGE'],
      },
      _count: {
        scores: 0,
      },
    },
    {
      id: 'judge-2',
      userId: 'user-2',
      user: {
        id: 'user-2',
        name: 'Judge Two',
        email: 'judge2@example.com',
        handle: 'judge2',
        avatarUrl: null,
        roles: ['JUDGE'],
      },
      _count: {
        scores: 5,
      },
    },
  ];

  const defaultProps = {
    hackathonId: 'hack-1',
    judges: mockJudges,
    onUpdate: mockOnUpdate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthToken as any).mockReturnValue('mock-token');
    (global.confirm as any).mockReturnValue(true);
  });

  it('should render judge assignment interface', () => {
    render(<JudgeAssignment {...defaultProps} />);

    expect(screen.getByText(/Assign Judge/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by name, email, or handle/i)).toBeInTheDocument();
  });

  it('should display assigned judges', () => {
    render(<JudgeAssignment {...defaultProps} />);

    expect(screen.getByText(/Assigned Judges \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('Judge One')).toBeInTheDocument();
    expect(screen.getByText('Judge Two')).toBeInTheDocument();
  });

  it('should show score count for judges with scores', () => {
    render(<JudgeAssignment {...defaultProps} />);

    expect(screen.getByText(/5 scores/i)).toBeInTheDocument();
  });

  it('should search for judges', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 'user-3',
        name: 'New Judge',
        email: 'newjudge@example.com',
        handle: 'newjudge',
        avatarUrl: null,
        roles: ['JUDGE'],
      },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<JudgeAssignment {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Search by name, email, or handle/i);
    await user.type(searchInput, 'New Judge');

    const searchButton = screen.getByRole('button', { name: /Search/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('New Judge')).toBeInTheDocument();
      expect(screen.getByText('1 user(s) found')).toBeInTheDocument();
    });
  });

  it('should filter out already assigned judges from search results', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      mockJudges[0].user,
      {
        id: 'user-3',
        name: 'New Judge',
        email: 'newjudge@example.com',
        handle: 'newjudge',
        avatarUrl: null,
        roles: ['JUDGE'],
      },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<JudgeAssignment {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Search by name, email, or handle/i);
    await user.type(searchInput, 'Judge');

    const searchButton = screen.getByRole('button', { name: /Search/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('1 user(s) found')).toBeInTheDocument();
      expect(screen.getByText('New Judge')).toBeInTheDocument();
    });
  });

  it('should assign a judge successfully', async () => {
    const user = userEvent.setup();
    (assignJudge as any).mockResolvedValue({ success: true });
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'user-3',
          name: 'New Judge',
          email: 'newjudge@example.com',
          handle: 'newjudge',
          avatarUrl: null,
          roles: ['JUDGE'],
        },
      ],
    });

    render(<JudgeAssignment {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Search by name, email, or handle/i);
    await user.type(searchInput, 'New Judge');

    const searchButton = screen.getByRole('button', { name: /Search/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('New Judge')).toBeInTheDocument();
    });

    const assignButton = screen.getByRole('button', { name: /Assign$/i });
    await user.click(assignButton);

    await waitFor(() => {
      expect(assignJudge).toHaveBeenCalledWith('hack-1', 'user-3', 'mock-token');
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should show loading state while assigning', async () => {
    const user = userEvent.setup();
    (assignJudge as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'user-3',
          name: 'New Judge',
          email: 'newjudge@example.com',
          handle: 'newjudge',
          avatarUrl: null,
          roles: ['JUDGE'],
        },
      ],
    });

    render(<JudgeAssignment {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Search by name, email, or handle/i);
    await user.type(searchInput, 'New Judge');

    const searchButton = screen.getByRole('button', { name: /Search/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('New Judge')).toBeInTheDocument();
    });

    const assignButton = screen.getByRole('button', { name: /Assign$/i });
    await user.click(assignButton);

    await waitFor(() => {
      expect(screen.getByText(/Assigning.../i)).toBeInTheDocument();
    });
  });

  it('should remove a judge without scores', async () => {
    const user = userEvent.setup();
    (removeJudge as any).mockResolvedValue({ success: true });

    render(<JudgeAssignment {...defaultProps} />);

    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    await user.click(removeButtons[0]);

    await waitFor(() => {
      expect(removeJudge).toHaveBeenCalledWith('hack-1', 'user-1', 'mock-token');
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should not remove a judge with scores', async () => {
    render(<JudgeAssignment {...defaultProps} />);

    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    const judgeWithScoresButton = removeButtons[1];

    expect(judgeWithScoresButton).toBeDisabled();
    expect(judgeWithScoresButton).toHaveAttribute('title', 'Cannot remove judge with scores');
  });

  it('should show error when search fails', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    render(<JudgeAssignment {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Search by name, email, or handle/i);
    await user.type(searchInput, 'Judge');

    const searchButton = screen.getByRole('button', { name: /Search/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should show empty state when no judges assigned', () => {
    render(<JudgeAssignment {...defaultProps} judges={[]} />);

    expect(
      screen.getByText(/No judges assigned yet. Search and assign judges above./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Assigned Judges \(0\)/i)).toBeInTheDocument();
  });

  it('should show error when search query is empty', async () => {
    const user = userEvent.setup();

    render(<JudgeAssignment {...defaultProps} />);

    const searchButton = screen.getByRole('button', { name: /Search/i });
    await user.click(searchButton);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should search on Enter key press', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<JudgeAssignment {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Search by name, email, or handle/i);
    await user.type(searchInput, 'Judge{Enter}');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should show confirmation dialog before removing judge', async () => {
    const user = userEvent.setup();
    (global.confirm as any).mockReturnValue(false);
    (removeJudge as any).mockResolvedValue({ success: true });

    render(<JudgeAssignment {...defaultProps} />);

    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    await user.click(removeButtons[0]);

    expect(global.confirm).toHaveBeenCalled();
    expect(removeJudge).not.toHaveBeenCalled();
  });

  it('should handle authentication error', async () => {
    const user = userEvent.setup();
    (getAuthToken as any).mockReturnValue(null);
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<JudgeAssignment {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Search by name, email, or handle/i);
    await user.type(searchInput, 'Judge');

    const searchButton = screen.getByRole('button', { name: /Search/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('should display progress indicator', () => {
    render(<JudgeAssignment {...defaultProps} />);

    expect(screen.getByText(/Judging Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Judges Assigned/i)).toBeInTheDocument();
  });
});
