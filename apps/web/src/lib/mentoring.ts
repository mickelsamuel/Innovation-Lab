/**
 * Mentoring API client functions
 */

import { apiFetch } from './api';

export interface Mentor {
  id: string;
  userId: string;
  hackathonId: string;
  bio?: string;
  calendlyUrl?: string;
  expertise: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    handle?: string;
  };
}

/**
 * Assign a mentor to a hackathon
 */
export async function assignMentor(
  hackathonId: string,
  userId: string,
  token: string
): Promise<Mentor> {
  return apiFetch<Mentor>(`/hackathons/${hackathonId}/mentors`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    token,
  });
}

/**
 * Get all mentors for a hackathon
 */
export async function getMentors(hackathonId: string): Promise<Mentor[]> {
  return apiFetch<Mentor[]>(`/hackathons/${hackathonId}/mentors`);
}

/**
 * Remove a mentor from a hackathon
 */
export async function removeMentor(
  hackathonId: string,
  userId: string,
  token: string
): Promise<void> {
  return apiFetch<void>(`/hackathons/${hackathonId}/mentors/${userId}`, {
    method: 'DELETE',
    token,
  });
}
