/**
 * Team API client functions
 */

import { apiFetch, buildQueryString } from './api';
import type { Team } from '@/types/team';

export interface TeamFilters {
  hackathonId: string;
  lookingForMembers?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch teams for a hackathon
 */
export async function getTeams(filters: TeamFilters): Promise<Team[]> {
  const queryString = buildQueryString(filters);
  return apiFetch<Team[]>(`/teams${queryString}`);
}

/**
 * Fetch a single team by ID
 */
export async function getTeamById(id: string): Promise<Team> {
  return apiFetch<Team>(`/teams/${id}`);
}

/**
 * Create a new team
 */
export async function createTeam(
  data: {
    hackathonId: string;
    name: string;
    bio?: string;
    lookingForMembers?: boolean;
  },
  token: string
): Promise<Team> {
  return apiFetch<Team>('/teams', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Update team details
 */
export async function updateTeam(
  id: string,
  data: {
    name?: string;
    bio?: string;
    lookingForMembers?: boolean;
  },
  token: string
): Promise<Team> {
  return apiFetch<Team>(`/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Add member to team
 */
export async function addTeamMember(
  teamId: string,
  data: {
    userId: string;
    role: 'LEAD' | 'MEMBER';
  },
  token: string
): Promise<Team> {
  return apiFetch<Team>(`/teams/${teamId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Remove member from team
 */
export async function removeTeamMember(
  teamId: string,
  userId: string,
  token: string
): Promise<void> {
  return apiFetch<void>(`/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Delete team
 */
export async function deleteTeam(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/teams/${id}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Request to join a team
 */
export async function requestToJoinTeam(
  teamId: string,
  message: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/teams/${teamId}/join-request`, {
    method: 'POST',
    body: JSON.stringify({ message }),
    token,
  });
}

/**
 * Get current user's teams
 */
export async function getUserTeams(
  token: string,
  hackathonId?: string
): Promise<Team[]> {
  const queryString = hackathonId ? buildQueryString({ hackathonId }) : '';
  return apiFetch<Team[]>(`/teams/my${queryString}`, { token });
}
