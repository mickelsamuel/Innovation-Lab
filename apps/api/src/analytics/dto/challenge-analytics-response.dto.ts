export class ChallengeAnalyticsResponseDto {
  challengeId: string;
  challengeSlug: string;
  challengeName: string;
  category: string;
  difficulty: string;
  totalAttempts: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  averageScore: number;
  averageReviewTime: number;
  submissionTrend: Array<{
    date: string;
    submissions: number;
    accepted: number;
  }>;
  topPerformers: Array<{
    userId: string;
    userName: string;
    score: number;
    submittedAt: string;
  }>;
  difficultyPerception: {
    tooEasy: number;
    justRight: number;
    tooHard: number;
  };
  categoryPerformance: {
    category: string;
    averageScore: number;
    completionRate: number;
  };
}
