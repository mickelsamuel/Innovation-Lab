/**
 * Team Invitation TypeScript types
 */

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  invitedById: string;
  inviteeId?: string;
  inviteeEmail?: string;
  role: 'LEAD' | 'MEMBER';
  status: InvitationStatus;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  team?: {
    id: string;
    name: string;
    hackathon: {
      id: string;
      title: string;
      slug: string;
      maxTeamSize: number;
    };
    _count?: {
      members: number;
    };
  };
  invitedBy: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  invitee?: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
}

export interface SendInvitationRequest {
  inviteeId?: string;
  inviteeEmail?: string;
  role: 'LEAD' | 'MEMBER';
}
