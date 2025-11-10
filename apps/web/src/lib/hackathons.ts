/**
 * Hackathon API client functions
 */

import { apiFetch, buildQueryString } from './api';
import type { Hackathon, HackathonsResponse, HackathonFilters } from '@/types/hackathon';

/**
 * Fetch all hackathons with optional filters
 */
export async function getHackathons(filters: HackathonFilters = {}): Promise<HackathonsResponse> {
  const queryString = buildQueryString(filters);
  return apiFetch<HackathonsResponse>(`/hackathons${queryString}`);
}

/**
 * Fetch a single hackathon by ID
 */
export async function getHackathonById(id: string): Promise<Hackathon> {
  return apiFetch<Hackathon>(`/hackathons/${id}`);
}

/**
 * Fetch a single hackathon by slug
 */
export async function getHackathonBySlug(slug: string): Promise<Hackathon> {
  return apiFetch<Hackathon>(`/hackathons/slug/${slug}`);
}

/**
 * Get hackathon statistics
 */
export async function getHackathonStats(id: string): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/hackathons/${id}/stats`);
}

/**
 * Create a new hackathon
 */
export async function createHackathon(
  data: Record<string, unknown>,
  token: string
): Promise<Hackathon> {
  return apiFetch<Hackathon>('/hackathons', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Update a hackathon
 */
export async function updateHackathon(
  id: string,
  data: Record<string, unknown>,
  token: string
): Promise<Hackathon> {
  return apiFetch<Hackathon>(`/hackathons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Delete a hackathon
 */
export async function deleteHackathon(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/hackathons/${id}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Assign a judge to a hackathon
 */
export async function assignJudge(
  hackathonId: string,
  userId: string,
  token: string
): Promise<void> {
  return apiFetch<void>(`/hackathons/${hackathonId}/judges`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    token,
  });
}

/**
 * Register for a hackathon
 */
export async function registerForHackathon(
  hackathonId: string,
  token: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/hackathons/${hackathonId}/register`, {
    method: 'POST',
    token,
  });
}

/**
 * Remove a judge from a hackathon
 */
export async function removeJudge(
  hackathonId: string,
  userId: string,
  token: string
): Promise<void> {
  return apiFetch<void>(`/hackathons/${hackathonId}/judges/${userId}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Assign a mentor to a hackathon
 */
export async function assignMentor(
  hackathonId: string,
  userId: string,
  token: string
): Promise<void> {
  return apiFetch<void>(`/hackathons/${hackathonId}/mentors`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    token,
  });
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

/**
 * Calculate rankings for a hackathon
 */
export async function calculateRankings(
  hackathonId: string,
  token: string
): Promise<Array<{ submissionId: string; rank: number; totalScore: number }>> {
  return apiFetch<Array<{ submissionId: string; rank: number; totalScore: number }>>(
    `/hackathons/${hackathonId}/calculate-rankings`,
    {
      method: 'POST',
      token,
    }
  );
}

/**
 * Announce winners for a hackathon
 */
export async function announceWinners(
  hackathonId: string,
  winners: unknown[],
  token: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/hackathons/${hackathonId}/winners`, {
    method: 'POST',
    body: JSON.stringify({ winners }),
    token,
  });
}

/**
 * Create an announcement for a hackathon
 */
export async function createAnnouncement(
  hackathonId: string,
  data: { title: string; body: string; pinned?: boolean },
  token: string
): Promise<{ id: string; title: string; content: string; createdAt: string }> {
  return apiFetch<{ id: string; title: string; content: string; createdAt: string }>(
    `/hackathons/${hackathonId}/announcements`,
    {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }
  );
}

/**
 * Get all announcements for a hackathon
 */
export async function getAnnouncements(
  hackathonId: string
): Promise<Array<{ id: string; title: string; content: string; createdAt: string }>> {
  return apiFetch<Array<{ id: string; title: string; content: string; createdAt: string }>>(
    `/hackathons/${hackathonId}/announcements`
  );
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(
  hackathonId: string,
  announcementId: string,
  token: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `/hackathons/${hackathonId}/announcements/${announcementId}`,
    {
      method: 'DELETE',
      token,
    }
  );
}
