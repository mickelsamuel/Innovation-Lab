import { render, screen, waitFor } from '../../../test/utils/custom-render';
import { NotificationBell } from './NotificationBell';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/notifications';
import { getAuthToken } from '@/lib/api';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/lib/notifications', () => ({
  getNotifications: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  getAuthToken: vi.fn(),
}));

vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '5 minutes ago',
}));

describe('NotificationBell', () => {
  const mockNotifications = [
    {
      id: 'notif-1',
      type: 'HACKATHON_REGISTRATION',
      title: 'Hackathon Registration',
      message: 'You have been registered for Innovation Hackathon',
      link: '/hackathons/hack-1',
      readAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      type: 'TEAM_INVITATION',
      title: 'Team Invitation',
      message: 'You have been invited to join Team Alpha',
      link: '/teams/team-1',
      readAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (getAuthToken as any).mockReturnValue('mock-token');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show loading state initially', () => {
    (getNotifications as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<NotificationBell />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should render notification bell with unread count', async () => {
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('should show 9+ for more than 9 unread notifications', async () => {
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 15,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText('9+')).toBeInTheDocument();
    });
  });

  it('should not show badge when no unread notifications', async () => {
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications.map(n => ({ ...n, readAt: new Date().toISOString() })),
      unreadCount: 0,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  it('should open dropdown menu on click', async () => {
    const user = userEvent.setup({ delay: null });
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Hackathon Registration')).toBeInTheDocument();
    });
  });

  it('should display notification items with correct icons', async () => {
    const user = userEvent.setup({ delay: null });
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('🎉')).toBeInTheDocument();
      expect(screen.getByText('👥')).toBeInTheDocument();
    });
  });

  it('should show unread indicator for unread notifications', async () => {
    const user = userEvent.setup({ delay: null });
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      const notificationItems = screen.getAllByRole('menuitem');
      expect(notificationItems[0]).toHaveClass('bg-primary/5');
    });
  });

  it('should mark notification as read when clicked', async () => {
    const user = userEvent.setup({ delay: null });
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });
    (markAsRead as any).mockResolvedValue({ success: true });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Hackathon Registration')).toBeInTheDocument();
    });

    const notificationLink = screen.getByText('Hackathon Registration').closest('a');
    await user.click(notificationLink!);

    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalledWith('notif-1', 'mock-token');
    });
  });

  it('should mark all as read when button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });
    (markAllAsRead as any).mockResolvedValue({ success: true });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/Mark all as read/i)).toBeInTheDocument();
    });

    const markAllButton = screen.getByText(/Mark all as read/i);
    await user.click(markAllButton);

    await waitFor(() => {
      expect(markAllAsRead).toHaveBeenCalledWith('mock-token');
    });
  });

  it('should not show "Mark all as read" when no unread notifications', async () => {
    const user = userEvent.setup({ delay: null });
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications.map(n => ({ ...n, readAt: new Date().toISOString() })),
      unreadCount: 0,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.queryByText(/Mark all as read/i)).not.toBeInTheDocument();
    });
  });

  it('should show empty state when no notifications', async () => {
    const user = userEvent.setup({ delay: null });
    (getNotifications as any).mockResolvedValue({
      notifications: [],
      unreadCount: 0,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });
  });

  it('should poll for new notifications every 30 seconds', async () => {
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });

    render(<NotificationBell />);

    expect(getNotifications).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(30000);
    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalledTimes(2);
    });

    vi.advanceTimersByTime(30000);
    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalledTimes(3);
    });
  });

  it('should handle fetch error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (getNotifications as any).mockRejectedValue(new Error('Network error'));

    render(<NotificationBell />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle mark as read error gracefully', async () => {
    const user = userEvent.setup({ delay: null });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });
    (markAsRead as any).mockRejectedValue(new Error('Failed to mark as read'));

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Hackathon Registration')).toBeInTheDocument();
    });

    const notificationLink = screen.getByText('Hackathon Registration').closest('a');
    await user.click(notificationLink!);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should not fetch notifications when not authenticated', async () => {
    (getAuthToken as any).mockReturnValue(null);

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    expect(getNotifications).not.toHaveBeenCalled();
  });

  it('should display time ago for notifications', async () => {
    const user = userEvent.setup({ delay: null });
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getAllByText('5 minutes ago')).toHaveLength(2);
    });
  });

  it('should show "View all notifications" link', async () => {
    const user = userEvent.setup({ delay: null });
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('View all notifications')).toBeInTheDocument();
    });
  });

  it('should close dropdown after clicking notification', async () => {
    const user = userEvent.setup({ delay: null });
    (getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });
    (markAsRead as any).mockResolvedValue({ success: true });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Hackathon Registration')).toBeInTheDocument();
    });

    const notificationLink = screen.getByText('Hackathon Registration').closest('a');
    await user.click(notificationLink!);

    // Dropdown should close (Notifications label should disappear)
    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });
});
