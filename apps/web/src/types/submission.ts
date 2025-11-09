/**
 * Submission-related TypeScript types
 */

export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  FINAL = 'FINAL',
  DISQUALIFIED = 'DISQUALIFIED',
}

export interface Submission {
  id: string;
  hackathonId: string;
  teamId: string;
  trackId?: string;
  title: string;
  abstract: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  files?: string[];
  status: SubmissionStatus;
  submittedAt?: string;
  finalizedAt?: string;
  scoreAggregate?: number;
  rank?: number;
  createdAt: string;
  updatedAt: string;
  team?: {
    id: string;
    name: string;
    members: Array<{
      id: string;
      role: 'LEAD' | 'MEMBER';
      user: {
        id: string;
        name: string;
        handle: string;
        avatarUrl?: string;
      };
    }>;
  };
  track?: {
    id: string;
    title: string;
    description: string;
  };
  hackathon?: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
  scores?: Array<{
    id: string;
    value: number;
    feedback?: string;
    criterion: {
      id: string;
      name: string;
      maxScore: number;
    };
    judge: {
      user: {
        name: string;
        handle: string;
      };
    };
  }>;
}

export interface SubmissionsResponse {
  data: Submission[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateSubmissionInput {
  hackathonId: string;
  teamId: string;
  trackId?: string;
  title: string;
  abstract: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  files?: string[];
}

export interface UpdateSubmissionInput {
  title?: string;
  abstract?: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  files?: string[];
  trackId?: string;
}
