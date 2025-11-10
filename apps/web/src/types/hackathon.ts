/**
 * Hackathon-related TypeScript types
 */

export enum HackathonStatus {
  DRAFT = 'DRAFT',
  UPCOMING = 'UPCOMING',
  LIVE = 'LIVE',
  JUDGING = 'JUDGING',
  CLOSED = 'CLOSED',
}

export enum HackathonLocation {
  VIRTUAL = 'VIRTUAL',
  ONSITE = 'ONSITE',
  HYBRID = 'HYBRID',
}

export interface HackathonTrack {
  id: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
}

export interface JudgingCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  weight: number;
  order: number;
}

export interface Hackathon {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  status: HackathonStatus;
  location: HackathonLocation;
  virtualUrl?: string;
  venue?: string;
  city?: string;
  country?: string;
  timezone?: string;
  bannerUrl?: string;
  logoUrl?: string;
  startsAt: string;
  endsAt: string;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  submissionOpensAt?: string;
  submissionClosesAt?: string;
  prizePool?: number;
  maxTeamSize: number;
  minTeamSize: number;
  allowSoloTeams: boolean;
  requireApproval: boolean;
  isPublished: boolean;
  tracks?: HackathonTrack[];
  criteria?: JudgingCriterion[];
  _count?: {
    teams: number;
    submissions: number;
    judges: number;
    mentors: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HackathonsResponse {
  data: Hackathon[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface HackathonFilters {
  [key: string]: unknown;
  status?: HackathonStatus;
  location?: HackathonLocation;
  search?: string;
  page?: number;
  limit?: number;
}
