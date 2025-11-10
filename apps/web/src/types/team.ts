/**
 * Team-related TypeScript types
 */

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'LEAD' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
    bio?: string;
  };
}

export interface Team {
  id: string;
  hackathonId: string;
  name: string;
  bio?: string;
  lookingForMembers: boolean;
  currentSize: number;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
  hackathon?: {
    id: string;
    title: string;
    slug: string;
    maxTeamSize: number;
    minTeamSize: number;
  };
  _count?: {
    members: number;
    submissions?: number;
  };
}

export interface TeamsResponse {
  data: Team[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
