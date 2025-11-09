/**
 * Team Invitations API client functions
 */

import { apiFetch } from './api';
import type { TeamInvitation, SendInvitationRequest } from '@/types/invitation';

/**
 * Send a team invitation
 */
export async function sendInvitation(
  teamId: string,
  data: SendInvitationRequest,
  token: string
): Promise<TeamInvitation> {
  return apiFetch<TeamInvitation>(`/teams/${teamId}/invitations`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Get team invitations
 */
export async function getTeamInvitations(
  teamId: string,
  token: string
): Promise<TeamInvitation[]> {
  return apiFetch<TeamInvitation[]>(`/teams/${teamId}/invitations`, {
    token,
  });
}

/**
 * Get current user's pending invitations
 */
export async function getUserInvitations(token: string): Promise<TeamInvitation[]> {
  return apiFetch<TeamInvitation[]>('/users/me/invitations', {
    token,
  });
}

/**
 * Accept a team invitation
 */
export async function acceptInvitation(
  invitationId: string,
  token: string
): Promise<TeamInvitation[]> {
  return apiFetch<TeamInvitation[]>(`/invitations/${invitationId}/accept`, {
    method: 'PUT',
    token,
  });
}

/**
 * Reject a team invitation
 */
export async function rejectInvitation(
  invitationId: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `/invitations/${invitationId}/reject`,
    {
      method: 'PUT',
      token,
    }
  );
}

/**
 * Cancel a team invitation (sender only)
 */
export async function cancelInvitation(
  invitationId: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `/invitations/${invitationId}`,
    {
      method: 'DELETE',
      token,
    }
  );
}
