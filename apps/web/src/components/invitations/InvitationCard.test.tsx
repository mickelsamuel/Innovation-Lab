import { render, screen, waitFor } from '../../../test/utils/custom-render';
import { InvitationCard } from './InvitationCard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { acceptInvitation, rejectInvitation, cancelInvitation } from '@/lib/invitations';
import type { Mock } from 'vitest';
import { useSession } from 'next-auth/react';
import { InvitationStatus } from '@/types/invitation';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/lib/invitations', () => ({
  acceptInvitation: vi.fn(),
  rejectInvitation: vi.fn(),
  cancelInvitation: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Type the mocks
const mockAcceptInvitation = acceptInvitation as Mock;
const mockRejectInvitation = rejectInvitation as Mock;
const mockCancelInvitation = cancelInvitation as Mock;
const mockUseSession = useSession as Mock;

describe('InvitationCard', () => {
  const mockOnUpdate = vi.fn();
  const mockSession = {
    accessToken: 'mock-token',
    user: { id: 'user-1', email: 'test@example.com' },
  };

  const mockInvitation = {
    id: 'inv-1',
    teamId: 'team-1',
    invitedById: 'user-2',
    inviteeId: 'user-1',
    inviteeEmail: undefined,
    role: 'MEMBER' as const,
    status: InvitationStatus.PENDING,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    expiresAt: new Date('2024-12-31').toISOString(),
    invitedBy: {
      id: 'user-2',
      name: 'John Doe',
      handle: 'johndoe',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    invitee: {
      id: 'user-1',
      name: 'Jane Smith',
      handle: 'janesmith',
    },
    team: {
      id: 'team-1',
      name: 'Team Alpha',
      hackathon: {
        id: 'hack-1',
        title: 'Innovation Hackathon 2024',
        slug: 'innovation-hackathon-2024',
        maxTeamSize: 5,
      },
      _count: {
        members: 3,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({ data: mockSession });
  });

  describe('Rendering - User Variant', () => {
    it('should render invitation card with team details', () => {
      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('@johndoe')).toBeInTheDocument();
      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      expect(screen.getByText('Innovation Hackathon 2024')).toBeInTheDocument();
    });

    it('should display status badge', () => {
      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      expect(screen.getByText('PENDING')).toBeInTheDocument();
    });

    it('should show team member count', () => {
      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      expect(screen.getByText('3 / 5 members')).toBeInTheDocument();
    });

    it('should show role badge', () => {
      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      const roleBadges = screen.getAllByText('MEMBER');
      expect(roleBadges.length).toBeGreaterThan(0);
    });

    it('should display invitation dates', () => {
      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      expect(screen.getByText(/Sent/i)).toBeInTheDocument();
      expect(screen.getByText(/Expires/i)).toBeInTheDocument();
    });

    it('should show accept and reject buttons for pending invitations', () => {
      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      expect(screen.getByRole('button', { name: /Accept/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
    });
  });

  describe('Rendering - Team Variant', () => {
    it('should render invitation card with invitee details', () => {
      render(<InvitationCard invitation={mockInvitation} variant="team" />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/Invitee:/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith \(@janesmith\)/i)).toBeInTheDocument();
    });

    it('should show invitee email when user not registered', () => {
      const invitationWithEmail = {
        ...mockInvitation,
        invitee: undefined,
        inviteeEmail: 'newuser@example.com',
      };

      render(<InvitationCard invitation={invitationWithEmail} variant="team" />);

      expect(screen.getByText('newuser@example.com')).toBeInTheDocument();
    });

    it('should show cancel button for pending invitations', () => {
      render(<InvitationCard invitation={mockInvitation} variant="team" />);

      expect(screen.getByRole('button', { name: /Cancel Invitation/i })).toBeInTheDocument();
    });
  });

  describe('Status Handling', () => {
    it('should show accepted status', () => {
      const acceptedInvitation = {
        ...mockInvitation,
        status: InvitationStatus.ACCEPTED,
      };

      render(<InvitationCard invitation={acceptedInvitation} variant="user" />);

      expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Accept/i })).not.toBeInTheDocument();
    });

    it('should show rejected status', () => {
      const rejectedInvitation = {
        ...mockInvitation,
        status: InvitationStatus.REJECTED,
      };

      render(<InvitationCard invitation={rejectedInvitation} variant="user" />);

      expect(screen.getByText('REJECTED')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Accept/i })).not.toBeInTheDocument();
    });

    it('should show expired status', () => {
      const expiredInvitation = {
        ...mockInvitation,
        status: InvitationStatus.EXPIRED,
      };

      render(<InvitationCard invitation={expiredInvitation} variant="user" />);

      expect(screen.getByText('EXPIRED')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Accept/i })).not.toBeInTheDocument();
    });

    it('should not show buttons for expired invitations', () => {
      const expiredInvitation = {
        ...mockInvitation,
        expiresAt: new Date('2020-01-01').toISOString(),
      };

      render(<InvitationCard invitation={expiredInvitation} variant="user" />);

      expect(screen.queryByRole('button', { name: /Accept/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Reject/i })).not.toBeInTheDocument();
    });
  });

  describe('Accept Invitation', () => {
    it('should accept invitation successfully', async () => {
      const user = userEvent.setup();
      mockAcceptInvitation.mockResolvedValue({ success: true });

      render(<InvitationCard invitation={mockInvitation} variant="user" onUpdate={mockOnUpdate} />);

      const acceptButton = screen.getByRole('button', { name: /Accept/i });
      await user.click(acceptButton);

      await waitFor(() => {
        expect(acceptInvitation).toHaveBeenCalledWith('inv-1', 'mock-token');
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    it('should show loading state while accepting', async () => {
      const user = userEvent.setup();
      mockAcceptInvitation.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      const acceptButton = screen.getByRole('button', { name: /Accept/i });
      await user.click(acceptButton);

      await waitFor(() => {
        expect(screen.getByText(/Accepting.../i)).toBeInTheDocument();
      });
    });

    it('should handle accept error', async () => {
      const user = userEvent.setup();
      mockAcceptInvitation.mockRejectedValue(new Error('Team is full'));

      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      const acceptButton = screen.getByRole('button', { name: /Accept/i });
      await user.click(acceptButton);

      await waitFor(() => {
        expect(acceptInvitation).toHaveBeenCalled();
        expect(mockOnUpdate).not.toHaveBeenCalled();
      });
    });

    it('should show error when not logged in', async () => {
      const user = userEvent.setup();
      mockUseSession.mockReturnValue({ data: null });

      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      const acceptButton = screen.getByRole('button', { name: /Accept/i });
      await user.click(acceptButton);

      await waitFor(() => {
        expect(acceptInvitation).not.toHaveBeenCalled();
      });
    });
  });

  describe('Reject Invitation', () => {
    it('should reject invitation successfully', async () => {
      const user = userEvent.setup();
      mockRejectInvitation.mockResolvedValue({ success: true });

      render(<InvitationCard invitation={mockInvitation} variant="user" onUpdate={mockOnUpdate} />);

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(rejectInvitation).toHaveBeenCalledWith('inv-1', 'mock-token');
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    it('should show loading state while rejecting', async () => {
      const user = userEvent.setup();
      mockRejectInvitation.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByText(/Rejecting.../i)).toBeInTheDocument();
      });
    });

    it('should handle reject error', async () => {
      const user = userEvent.setup();
      mockRejectInvitation.mockRejectedValue(new Error('Failed to reject'));

      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(rejectInvitation).toHaveBeenCalled();
        expect(mockOnUpdate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Cancel Invitation', () => {
    it('should cancel invitation successfully', async () => {
      const user = userEvent.setup();
      mockCancelInvitation.mockResolvedValue({ success: true });

      render(<InvitationCard invitation={mockInvitation} variant="team" onUpdate={mockOnUpdate} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel Invitation/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(cancelInvitation).toHaveBeenCalledWith('inv-1', 'mock-token');
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    it('should show loading state while cancelling', async () => {
      const user = userEvent.setup();
      mockCancelInvitation.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<InvitationCard invitation={mockInvitation} variant="team" />);

      const cancelButton = screen.getByRole('button', { name: /Cancel Invitation/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/Cancelling.../i)).toBeInTheDocument();
      });
    });

    it('should handle cancel error', async () => {
      const user = userEvent.setup();
      mockCancelInvitation.mockRejectedValue(new Error('Failed to cancel'));

      render(<InvitationCard invitation={mockInvitation} variant="team" />);

      const cancelButton = screen.getByRole('button', { name: /Cancel Invitation/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(cancelInvitation).toHaveBeenCalled();
        expect(mockOnUpdate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Avatar Display', () => {
    it('should show avatar image when available', () => {
      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      const avatar = screen.getByRole('img', { hidden: true });
      expect(avatar).toHaveAttribute('src', expect.stringContaining('avatar.jpg'));
    });

    it('should show fallback initials when no avatar', () => {
      const invitationNoAvatar = {
        ...mockInvitation,
        invitedBy: {
          ...mockInvitation.invitedBy,
          avatarUrl: undefined,
        },
      };

      render(<InvitationCard invitation={invitationNoAvatar} variant="user" />);

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should use handle initial when no name', () => {
      const invitationNoName = {
        ...mockInvitation,
        invitedBy: {
          ...mockInvitation.invitedBy,
          name: '',
          avatarUrl: undefined,
        },
      };

      render(<InvitationCard invitation={invitationNoName} variant="user" />);

      expect(screen.getByText('j')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invitation without team data', () => {
      const invitationNoTeam = {
        ...mockInvitation,
        team: undefined,
      };

      render(<InvitationCard invitation={invitationNoTeam} variant="user" />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Team Alpha')).not.toBeInTheDocument();
    });

    it('should handle invitation without expiry date', () => {
      const invitationNoExpiry = {
        ...mockInvitation,
        expiresAt: undefined,
      };

      render(<InvitationCard invitation={invitationNoExpiry} variant="user" />);

      expect(screen.queryByText(/Expires/i)).not.toBeInTheDocument();
    });

    it('should disable buttons during loading', async () => {
      const user = userEvent.setup();
      mockAcceptInvitation.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<InvitationCard invitation={mockInvitation} variant="user" />);

      const acceptButton = screen.getByRole('button', { name: /Accept/i });
      await user.click(acceptButton);

      await waitFor(() => {
        const rejectButton = screen.getByRole('button', { name: /Rejecting.../i });
        expect(rejectButton).toBeDisabled();
      });
    });
  });
});
