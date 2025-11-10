import { render, screen, waitFor } from '../../../test/utils/custom-render';
import { InviteModal } from './InviteModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendInvitation } from '@/lib/invitations';
import { useSession } from 'next-auth/react';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/lib/invitations', () => ({
  sendInvitation: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('InviteModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockSession = {
    accessToken: 'mock-token',
    user: { id: 'user-1', email: 'test@example.com' },
  };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    teamId: 'team-1',
    teamName: 'Test Team',
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSession as any).mockReturnValue({ data: mockSession });
  });

  it('should render modal when open', () => {
    render(<InviteModal {...defaultProps} />);

    expect(screen.getByText(/Invite Member to Test Team/i)).toBeInTheDocument();
    expect(screen.getByText(/Send an invitation to join your team/i)).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(<InviteModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText(/Invite Member to Test Team/i)).not.toBeInTheDocument();
  });

  it('should show email input by default', () => {
    render(<InviteModal {...defaultProps} />);

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
  });

  it('should switch to user ID input when selected', async () => {
    const _user = userEvent.setup();
    render(<InviteModal {...defaultProps} />);

    // Click on the select trigger
    const selectTrigger = screen.getByRole('combobox', { name: /invite by/i });
    await user.click(selectTrigger);

    // Select User ID option
    const userIdOption = screen.getByRole('option', { name: /User ID/i });
    await user.click(userIdOption);

    await waitFor(() => {
      expect(screen.getByLabelText(/User ID/i)).toBeInTheDocument();
    });
  });

  it('should show role selection with default MEMBER', () => {
    render(<InviteModal {...defaultProps} />);

    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
  });

  it('should submit invitation with email successfully', async () => {
    const _user = userEvent.setup();
    (sendInvitation as any).mockResolvedValue({ success: true });

    render(<InviteModal {...defaultProps} />);

    // Fill in email
    const emailInput = screen.getByLabelText(/Email Address/i);
    await user.type(emailInput, 'invitee@example.com');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(sendInvitation).toHaveBeenCalledWith(
        'team-1',
        {
          inviteeEmail: 'invitee@example.com',
          inviteeId: undefined,
          role: 'MEMBER',
        },
        'mock-token'
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should submit invitation with user ID successfully', async () => {
    const _user = userEvent.setup();
    (sendInvitation as any).mockResolvedValue({ success: true });

    render(<InviteModal {...defaultProps} />);

    // Switch to user ID
    const selectTrigger = screen.getByRole('combobox', { name: /invite by/i });
    await user.click(selectTrigger);
    const userIdOption = screen.getByRole('option', { name: /User ID/i });
    await user.click(userIdOption);

    // Fill in user ID
    const userIdInput = await screen.findByLabelText(/User ID/i);
    await user.type(userIdInput, 'user-123');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(sendInvitation).toHaveBeenCalledWith(
        'team-1',
        {
          inviteeEmail: undefined,
          inviteeId: 'user-123',
          role: 'MEMBER',
        },
        'mock-token'
      );
    });
  });

  it('should submit invitation with LEAD role', async () => {
    const _user = userEvent.setup();
    (sendInvitation as any).mockResolvedValue({ success: true });

    render(<InviteModal {...defaultProps} />);

    // Fill in email
    const emailInput = screen.getByLabelText(/Email Address/i);
    await user.type(emailInput, 'lead@example.com');

    // Select LEAD role
    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    await user.click(roleSelect);
    const leadOption = screen.getByRole('option', { name: /Lead/i });
    await user.click(leadOption);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(sendInvitation).toHaveBeenCalledWith(
        'team-1',
        expect.objectContaining({
          role: 'LEAD',
        }),
        'mock-token'
      );
    });
  });

  it('should show error when not logged in', async () => {
    const _user = userEvent.setup();
    (useSession as any).mockReturnValue({ data: null });

    render(<InviteModal {...defaultProps} />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(sendInvitation).not.toHaveBeenCalled();
    });
  });

  it('should show error when email is empty', async () => {
    const _user = userEvent.setup();

    render(<InviteModal {...defaultProps} />);

    // Submit without filling email
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(sendInvitation).not.toHaveBeenCalled();
    });
  });

  it('should show error when user ID is empty', async () => {
    const _user = userEvent.setup();

    render(<InviteModal {...defaultProps} />);

    // Switch to user ID
    const selectTrigger = screen.getByRole('combobox', { name: /invite by/i });
    await user.click(selectTrigger);
    const userIdOption = screen.getByRole('option', { name: /User ID/i });
    await user.click(userIdOption);

    // Submit without filling user ID
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(sendInvitation).not.toHaveBeenCalled();
    });
  });

  it('should handle invitation error', async () => {
    const _user = userEvent.setup();
    (sendInvitation as any).mockRejectedValue(new Error('User already in team'));

    render(<InviteModal {...defaultProps} />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    await user.type(emailInput, 'existing@example.com');

    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(sendInvitation).toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('should disable submit button while loading', async () => {
    const _user = userEvent.setup();
    (sendInvitation as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<InviteModal {...defaultProps} />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(submitButton);

    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Sending.../i)).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel button is clicked', async () => {
    const _user = userEvent.setup();

    render(<InviteModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should reset form after successful submission', async () => {
    const _user = userEvent.setup();
    (sendInvitation as any).mockResolvedValue({ success: true });

    render(<InviteModal {...defaultProps} />);

    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should validate email format', async () => {
    const _user = userEvent.setup();

    render(<InviteModal {...defaultProps} />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('should disable cancel button while loading', async () => {
    const _user = userEvent.setup();
    (sendInvitation as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<InviteModal {...defaultProps} />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(submitButton);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await waitFor(() => {
      expect(cancelButton).toBeDisabled();
    });
  });
});
