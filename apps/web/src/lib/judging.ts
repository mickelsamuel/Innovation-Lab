/**
 * Judging API client functions
 */

import { apiFetch } from './api';
import type { Judge, JudgeAssignment, Score } from '@/types/judging';

/**
 * Assign a judge to a hackathon
 */
export async function assignJudge(
  hackathonId: string,
  userId: string,
  token: string
): Promise<Judge> {
  return apiFetch<Judge>(`/hackathons/${hackathonId}/judges`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    token,
  });
}

/**
 * Get all judges for a hackathon
 */
export async function getJudges(hackathonId: string): Promise<Judge[]> {
  return apiFetch<Judge[]>(`/hackathons/${hackathonId}/judges`);
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
 * Create a score for a submission
 */
export async function createScore(
  submissionId: string,
  data: {
    criterionId: string;
    value: number;
    feedback?: string;
  },
  token: string
): Promise<Score> {
  return apiFetch<Score>(`/submissions/${submissionId}/scores`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Get all scores for a submission
 */
export async function getScores(submissionId: string): Promise<Score[]> {
  return apiFetch<Score[]>(`/submissions/${submissionId}/scores`);
}

/**
 * Update a score
 */
export async function updateScore(
  scoreId: string,
  data: {
    value?: number;
    feedback?: string;
  },
  token: string
): Promise<Score> {
  return apiFetch<Score>(`/scores/${scoreId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Delete a score
 */
export async function deleteScore(scoreId: string, token: string): Promise<void> {
  return apiFetch<void>(`/scores/${scoreId}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Get judge assignments
 */
export async function getJudgeAssignments(
  token: string,
  hackathonId?: string
): Promise<JudgeAssignment[]> {
  const query = hackathonId ? `?hackathonId=${hackathonId}` : '';
  return apiFetch<JudgeAssignment[]>(`/judge/assignments${query}`, { token });
}

/**
 * Calculate rankings for a hackathon
 */
export async function calculateRankings(
  hackathonId: string,
  token: string
): Promise<{ success: boolean; message: string; submissionsRanked: number }> {
  return apiFetch(`/hackathons/${hackathonId}/calculate-rankings`, {
    method: 'POST',
    token,
  });
}
