/**
 * Mentors API client functions
 */

import { apiFetch } from './api';

export interface Mentor {
  id: string;
  userId: string;
  hackathonId: string;
  bio: string | null;
  calendlyUrl: string | null;
  expertise: string[];
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    handle: string | null;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
  };
  sessions?: MentorSession[];
  _count?: {
    sessions: number;
  };
}

export interface MentorSession {
  id: string;
  mentorId: string;
  title: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  booked: number;
  meetingUrl: string | null;
  createdAt: string;
  mentor?: Mentor;
}

export interface MentorAssignment {
  id: string;
  userId: string;
  hackathonId: string;
  hackathon: {
    id: string;
    slug: string;
    title: string;
    status: string;
    startsAt: string;
    endsAt: string;
    _count?: {
      teams: number;
      submissions: number;
    };
  };
  sessions: MentorSession[];
  _count: {
    sessions: number;
  };
}

/**
 * Assign a mentor to a hackathon
 */
export async function assignMentor(
  hackathonId: string,
  data: {
    userId: string;
    bio?: string;
    calendlyUrl?: string;
    expertise?: string[];
  },
  token: string
): Promise<Mentor> {
  return apiFetch<Mentor>(`/hackathons/${hackathonId}/mentors`, {
    method: 'POST',
    body: JSON.stringify(data),
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
): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/hackathons/${hackathonId}/mentors/${userId}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Update mentor profile
 */
export async function updateMentor(
  hackathonId: string,
  userId: string,
  data: {
    bio?: string;
    calendlyUrl?: string;
    expertise?: string[];
  },
  token: string
): Promise<Mentor> {
  return apiFetch<Mentor>(`/hackathons/${hackathonId}/mentors/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Get mentor's hackathon assignments
 */
export async function getMentorAssignments(token: string): Promise<MentorAssignment[]> {
  return apiFetch<MentorAssignment[]>('/mentors/my-assignments', { token });
}

/**
 * Create a mentor session (office hours)
 */
export async function createMentorSession(
  mentorId: string,
  data: {
    title?: string;
    startsAt: string;
    endsAt: string;
    capacity?: number;
    meetingUrl?: string;
  },
  token: string
): Promise<MentorSession> {
  return apiFetch<MentorSession>(`/mentors/${mentorId}/sessions`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Get sessions for a mentor
 */
export async function getMentorSessions(
  mentorId: string,
  includeAll = false
): Promise<MentorSession[]> {
  const query = includeAll ? '?includeAll=true' : '';
  return apiFetch<MentorSession[]>(`/mentors/${mentorId}/sessions${query}`);
}

/**
 * Delete a mentor session
 */
export async function deleteMentorSession(
  sessionId: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/sessions/${sessionId}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Get all upcoming sessions for a hackathon
 */
export async function getHackathonSessions(hackathonId: string): Promise<MentorSession[]> {
  return apiFetch<MentorSession[]>(`/hackathons/${hackathonId}/sessions`);
}
