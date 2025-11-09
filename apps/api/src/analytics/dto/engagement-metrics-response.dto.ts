export class EngagementMetricsResponseDto {
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
  averageSessionDuration: number;
  submissionsPerHackathon: number;
  participationRate: number;
  repeatParticipants: number;
  activityByDay: Array<{
    day: string;
    activities: number;
  }>;
  activityByHour: Array<{
    hour: number;
    activities: number;
  }>;
}
