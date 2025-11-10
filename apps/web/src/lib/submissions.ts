/**
 * Submission API client functions
 */

import { apiFetch, buildQueryString } from './api';
import type {
  Submission,
  CreateSubmissionInput,
  UpdateSubmissionInput,
  SubmissionStatus,
} from '@/types/submission';

export interface SubmissionFilters {
  hackathonId: string;
  status?: SubmissionStatus;
  teamId?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch submissions for a hackathon
 */
export async function getSubmissions(filters: SubmissionFilters): Promise<Submission[]> {
  const queryString = buildQueryString(filters);
  return apiFetch<Submission[]>(`/submissions${queryString}`);
}

/**
 * Fetch a single submission by ID
 */
export async function getSubmissionById(id: string): Promise<Submission> {
  return apiFetch<Submission>(`/submissions/${id}`);
}

/**
 * Create a new submission
 */
export async function createSubmission(
  data: CreateSubmissionInput,
  token: string
): Promise<Submission> {
  return apiFetch<Submission>('/submissions', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Update submission
 */
export async function updateSubmission(
  id: string,
  data: UpdateSubmissionInput,
  token: string
): Promise<Submission> {
  return apiFetch<Submission>(`/submissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Finalize submission (team lead only)
 */
export async function finalizeSubmission(id: string, token: string): Promise<Submission> {
  return apiFetch<Submission>(`/submissions/${id}/submit`, {
    method: 'POST',
    token,
  });
}

/**
 * Delete submission
 */
export async function deleteSubmission(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/submissions/${id}`, {
    method: 'DELETE',
    token,
  });
}
