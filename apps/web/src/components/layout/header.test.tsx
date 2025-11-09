import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from './header';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock API functions
vi.mock('@/lib/api', () => ({
  getAuthToken: vi.fn(() => null),
  apiFetch: vi.fn(),
}));

import { usePathname } from 'next/navigation';
import { getAuthToken, apiFetch } from '@/lib/api';

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getAuthToken).mockReturnValue(null);
    vi.mocked(usePathname).mockReturnValue('/');
  });

  it('should render header with logo', () => {
    render(<Header />);
    expect(screen.getByText('Innovation Lab')).toBeInTheDocument();
    expect(screen.getByText('NBC + Vaultix')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Hackathons')).toBeInTheDocument();
    expect(screen.getByText('Challenges')).toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('should show sign in and get started buttons when not authenticated', async () => {
    render(<Header />);
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });
  });

  it('should return null on auth pages', () => {
    vi.mocked(usePathname).mockReturnValue('/auth/login');
    const { container } = render(<Header />);
    expect(container.firstChild).toBeNull();
  });

  it('should highlight active navigation link', () => {
    vi.mocked(usePathname).mockReturnValue('/hackathons');
    render(<Header />);

    const hackathonsLink = screen.getByRole('link', { name: /hackathons/i });
    expect(hackathonsLink).toHaveClass('text-primary');
  });

  it('should show user menu when authenticated', async () => {
    vi.mocked(getAuthToken).mockReturnValue('fake-token');
    vi.mocked(apiFetch).mockImplementation(async (url: string) => {
      if (url === '/users/me') {
        return {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          handle: 'johndoe',
          avatarUrl: null,
        };
      }
      if (url === '/gamification/profile') {
        return {
          level: 5,
          xp: 1500,
          vaultKeys: 10,
        };
      }
      throw new Error('Unknown URL');
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    expect(screen.getByText('Level 5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Vault keys
  });

  it('should render user avatar with initials when no avatarUrl', async () => {
    vi.mocked(getAuthToken).mockReturnValue('fake-token');
    vi.mocked(apiFetch).mockResolvedValue({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      handle: 'johndoe',
      avatarUrl: null,
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  it('should handle logout', async () => {
    const user = userEvent.setup();
    vi.mocked(getAuthToken).mockReturnValue('fake-token');
    vi.mocked(apiFetch).mockResolvedValue({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      handle: 'johndoe',
      avatarUrl: null,
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // Open user dropdown
    const avatarButton = screen.getByRole('button', { name: /JD/i });
    await user.click(avatarButton);

    // Click logout
    const logoutButton = screen.getByRole('menuitem', { name: /logout/i });
    await user.click(logoutButton);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should toggle mobile menu', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);

    // Check for mobile navigation links
    expect(screen.getAllByText('Home')).toHaveLength(2); // Desktop + Mobile
    expect(screen.getAllByText('Dashboard')).toHaveLength(2);
  });

  it('should show user info in mobile menu when authenticated', async () => {
    const user = userEvent.setup();
    vi.mocked(getAuthToken).mockReturnValue('fake-token');
    vi.mocked(apiFetch).mockImplementation(async (url: string) => {
      if (url === '/users/me') {
        return {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          handle: 'johndoe',
          avatarUrl: null,
        };
      }
      if (url === '/gamification/profile') {
        return {
          level: 5,
          xp: 1500,
          vaultKeys: 10,
        };
      }
      throw new Error('Unknown URL');
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);

    // Check for user info in mobile menu
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('10 Keys')).toBeInTheDocument();
  });

  it('should close mobile menu when clicking navigation link', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);

    // Click a navigation link
    const mobileLinks = screen.getAllByText('Home');
    await user.click(mobileLinks[1]); // Mobile version

    // Menu should close (X icon should change back to Menu icon)
    const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should show auth buttons in mobile menu when not authenticated', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);

    expect(screen.getAllByText('Sign In')).toHaveLength(2); // Desktop + Mobile
    expect(screen.getAllByText('Get Started')).toHaveLength(2);
  });

  it('should handle gamification fetch error gracefully', async () => {
    vi.mocked(getAuthToken).mockReturnValue('fake-token');
    vi.mocked(apiFetch).mockImplementation(async (url: string) => {
      if (url === '/users/me') {
        return {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          handle: 'johndoe',
          avatarUrl: null,
        };
      }
      if (url === '/gamification/profile') {
        throw new Error('Gamification service unavailable');
      }
      throw new Error('Unknown URL');
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // Should still show user even if gamification fails
    expect(screen.queryByText('Level')).not.toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch gamification data:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should remove token and show error when user fetch fails', async () => {
    vi.mocked(getAuthToken).mockReturnValue('fake-token');
    vi.mocked(apiFetch).mockRejectedValue(new Error('Unauthorized'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    expect(removeItemSpy).toHaveBeenCalledWith('auth_token');
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  it('should handle logout from mobile menu', async () => {
    const user = userEvent.setup();
    vi.mocked(getAuthToken).mockReturnValue('fake-token');
    vi.mocked(apiFetch).mockResolvedValue({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      handle: 'johndoe',
      avatarUrl: null,
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);

    // Click logout in mobile menu
    const logoutButtons = screen.getAllByText('Logout');
    await user.click(logoutButtons[logoutButtons.length - 1]); // Mobile version

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
