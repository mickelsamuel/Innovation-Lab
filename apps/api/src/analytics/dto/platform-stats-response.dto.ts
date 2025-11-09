export class PlatformStatsResponseDto {
  totalUsers: number;
  activeUsers: number;
  totalHackathons: number;
  activeHackathons: number;
  totalChallenges: number;
  activeChallenges: number;
  totalSubmissions: number;
  totalTeams: number;
  averageTeamSize: number;
  topDepartments: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
}
