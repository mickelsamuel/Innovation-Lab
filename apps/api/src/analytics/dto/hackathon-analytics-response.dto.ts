export class HackathonAnalyticsResponseDto {
  hackathonId: string;
  hackathonName: string;
  status: string;
  totalRegistrations: number;
  totalTeams: number;
  totalSubmissions: number;
  completionRate: number;
  averageTeamSize: number;
  registrationFunnel: {
    registered: number;
    formedTeam: number;
    submitted: number;
    judged: number;
  };
  submissionTimeline: Array<{
    date: string;
    count: number;
  }>;
  departmentDistribution: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;
  judgeProgress: {
    totalJudges: number;
    activeJudges: number;
    submissionsJudged: number;
    submissionsPending: number;
    averageJudgingTime: number;
  };
  topTeams: Array<{
    teamId: string;
    teamName: string;
    score: number;
    members: number;
  }>;
}
