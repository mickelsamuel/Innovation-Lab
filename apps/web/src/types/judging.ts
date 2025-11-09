/**
 * Judging-related TypeScript types
 */

export interface Score {
  id: string;
  submissionId: string;
  judgeId: string;
  criterionId: string;
  value: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  criterion: {
    id: string;
    name: string;
    description: string;
    maxScore: number;
    weight: number;
    order: number;
  };
  judge: {
    id: string;
    user: {
      id: string;
      name: string;
      handle: string;
      avatarUrl?: string;
    };
  };
}

export interface Judge {
  id: string;
  hackathonId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    handle: string;
    email: string;
    avatarUrl?: string;
  };
  _count?: {
    scores: number;
  };
  createdAt: string;
}

export interface JudgeAssignment {
  id: string;
  hackathonId: string;
  userId: string;
  createdAt: string;
  hackathon: {
    id: string;
    title: string;
    slug: string;
    status: string;
    startsAt: string;
    endsAt: string;
    criteria: Array<{
      id: string;
      name: string;
      description: string;
      maxScore: number;
      weight: number;
      order: number;
    }>;
    submissions: Array<{
      id: string;
      title: string;
      abstract: string;
      status: string;
      scoreAggregate?: number;
      rank?: number;
      team: {
        id: string;
        name: string;
        members: Array<{
          id: string;
          userId: string;
          role: string;
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
      };
      _count: {
        scores: number;
      };
    }>;
  };
}
