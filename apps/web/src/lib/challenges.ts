/**
 * Challenge API client functions
 */

import { apiFetch, buildQueryString } from './api';
import type {
  Challenge,
  ChallengeSubmission,
  CreateChallengeInput,
  UpdateChallengeInput,
  SubmitSolutionInput,
  ReviewSolutionInput,
  ChallengeStatus,
} from '@/types/challenge';

export interface ChallengeFilters {
  status?: ChallengeStatus;
  category?: string;
  skill?: string;
  ownerId?: string;
  search?: string;
}

/**
 * Get all challenges with filters
 */
export async function getChallenges(
  filters: ChallengeFilters = {}
): Promise<Challenge[]> {
  const queryString = buildQueryString(filters);
  return apiFetch<Challenge[]>(`/challenges${queryString}`);
}

/**
 * Get challenge by ID
 */
export async function getChallengeById(id: string): Promise<Challenge> {
  return apiFetch<Challenge>(`/challenges/${id}`);
}

/**
 * Get challenge by slug
 */
export async function getChallengeBySlug(slug: string): Promise<Challenge> {
  return apiFetch<Challenge>(`/challenges/slug/${slug}`);
}

/**
 * Create a new challenge
 */
export async function createChallenge(
  data: CreateChallengeInput,
  token: string
): Promise<Challenge> {
  return apiFetch<Challenge>('/challenges', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Update challenge
 */
export async function updateChallenge(
  id: string,
  data: UpdateChallengeInput,
  token: string
): Promise<Challenge> {
  return apiFetch<Challenge>(`/challenges/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Delete challenge
 */
export async function deleteChallenge(
  id: string,
  token: string
): Promise<void> {
  return apiFetch<void>(`/challenges/${id}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Submit solution to challenge
 */
export async function submitSolution(
  challengeId: string,
  data: SubmitSolutionInput,
  token: string
): Promise<ChallengeSubmission> {
  return apiFetch<ChallengeSubmission>(`/challenges/${challengeId}/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Get all submissions for a challenge
 */
export async function getChallengeSubmissions(
  challengeId: string
): Promise<ChallengeSubmission[]> {
  return apiFetch<ChallengeSubmission[]>(
    `/challenges/${challengeId}/submissions`
  );
}

/**
 * Get user's submissions
 */
export async function getUserSubmissions(
  token: string
): Promise<ChallengeSubmission[]> {
  return apiFetch<ChallengeSubmission[]>('/challenges/user/submissions', {
    token,
  });
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(
  submissionId: string
): Promise<ChallengeSubmission> {
  return apiFetch<ChallengeSubmission>(
    `/challenges/submissions/${submissionId}`
  );
}

/**
 * Review submission
 */
export async function reviewSubmission(
  submissionId: string,
  data: ReviewSolutionInput,
  token: string
): Promise<ChallengeSubmission> {
  return apiFetch<ChallengeSubmission>(
    `/challenges/submissions/${submissionId}/review`,
    {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }
  );
}

/**
 * Get reward type display name
 */
export function getRewardTypeLabel(rewardType?: string): string {
  const labels: Record<string, string> = {
    CASH: 'Cash Prize',
    PRIZE: 'Prize',
    INTERNSHIP: 'Internship',
    RECOGNITION: 'Recognition',
  };
  return rewardType ? labels[rewardType] || rewardType : '';
}

/**
 * Get status badge variant
 */
export function getStatusVariant(
  status: string
): 'draft' | 'live' | 'warning' | 'secondary' {
  const variants: Record<
    string,
    'draft' | 'live' | 'warning' | 'secondary'
  > = {
    DRAFT: 'draft',
    OPEN: 'live',
    REVIEW: 'warning',
    CLOSED: 'secondary',
  };
  return variants[status] || 'secondary';
}

/**
 * Get submission status badge variant
 */
export function getSubmissionStatusVariant(
  status: string
): 'draft' | 'live' | 'warning' | 'secondary' | 'success' {
  const variants: Record<
    string,
    'draft' | 'live' | 'warning' | 'secondary' | 'success'
  > = {
    SUBMITTED: 'draft',
    UNDER_REVIEW: 'warning',
    ACCEPTED: 'success',
    REJECTED: 'secondary',
    WINNER: 'live',
  };
  return variants[status] || 'secondary';
}

/**
 * Check if challenge is accepting submissions
 */
export function isAcceptingSubmissions(challenge: Challenge): boolean {
  if (challenge.status !== 'OPEN') return false;
  if (!challenge.deadlineAt) return true;
  return new Date() < new Date(challenge.deadlineAt);
}

/**
 * Format deadline display
 */
export function formatDeadline(deadlineAt?: string): string {
  if (!deadlineAt) return 'No deadline';

  const deadline = new Date(deadlineAt);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return 'Deadline passed';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 7) return `${days} days left`;
  if (days < 30) return `${Math.ceil(days / 7)} weeks left`;
  return `${Math.ceil(days / 30)} months left`;
}
