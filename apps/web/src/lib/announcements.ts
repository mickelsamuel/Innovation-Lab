/**
 * Announcements API client functions
 */

import { apiFetch } from './api';
import type { Announcement, CreateAnnouncementInput } from '@/types/announcement';

/**
 * Get announcements for a hackathon
 */
export async function getHackathonAnnouncements(hackathonId: string): Promise<Announcement[]> {
  return apiFetch<Announcement[]>(`/hackathons/${hackathonId}/announcements`);
}

/**
 * Create an announcement for a hackathon
 */
export async function createAnnouncement(
  hackathonId: string,
  data: CreateAnnouncementInput,
  token: string
): Promise<Announcement> {
  return apiFetch<Announcement>(`/hackathons/${hackathonId}/announcements`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(
  hackathonId: string,
  announcementId: string,
  token: string
): Promise<void> {
  return apiFetch<void>(`/hackathons/${hackathonId}/announcements/${announcementId}`, {
    method: 'DELETE',
    token,
  });
}
