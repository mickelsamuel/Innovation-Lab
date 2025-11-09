/**
 * Challenge-related TypeScript types
 */

export enum ChallengeStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  REVIEW = 'REVIEW',
  CLOSED = 'CLOSED',
}

export enum ChallengeVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum RewardType {
  CASH = 'CASH',
  PRIZE = 'PRIZE',
  INTERNSHIP = 'INTERNSHIP',
  RECOGNITION = 'RECOGNITION',
}

export enum ChallengeSubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WINNER = 'WINNER',
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  problemStatement: string;
  ownerId: string;
  ownerOrg?: string;
  rewardType?: RewardType;
  rewardValue?: string;
  categories: string[];
  skills: string[];
  attachments: string[];
  status: ChallengeStatus;
  visibility: ChallengeVisibility;
  deadlineAt?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  _count?: {
    submissions: number;
  };
  submissions?: ChallengeSubmission[];
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId?: string;
  teamId?: string;
  title: string;
  repoUrl?: string;
  content: string;
  files: string[];
  status: ChallengeSubmissionStatus;
  score?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  team?: {
    id: string;
    name: string;
  };
  challenge?: {
    id: string;
    title: string;
    slug: string;
    status: ChallengeStatus;
  };
}

export interface CreateChallengeInput {
  slug: string;
  title: string;
  problemStatement: string;
  ownerOrg?: string;
  rewardType?: RewardType;
  rewardValue?: string;
  categories?: string[];
  skills?: string[];
  status?: ChallengeStatus;
  visibility?: ChallengeVisibility;
  deadlineAt?: string;
}

export interface UpdateChallengeInput {
  slug?: string;
  title?: string;
  problemStatement?: string;
  ownerOrg?: string;
  rewardType?: RewardType;
  rewardValue?: string;
  categories?: string[];
  skills?: string[];
  status?: ChallengeStatus;
  visibility?: ChallengeVisibility;
  deadlineAt?: string;
}

export interface SubmitSolutionInput {
  title: string;
  content: string;
  repoUrl?: string;
  teamId?: string;
}

export interface ReviewSolutionInput {
  status: ChallengeSubmissionStatus;
  score?: number;
  feedback?: string;
}
