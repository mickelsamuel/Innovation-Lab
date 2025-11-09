export class GrowthDataPoint {
  date: string;
  users: number;
  hackathons: number;
  challenges: number;
  submissions: number;
}

export class GrowthMetricsResponseDto {
  period: string;
  dataPoints: GrowthDataPoint[];
  trends: {
    userGrowth: number;
    hackathonGrowth: number;
    challengeGrowth: number;
    submissionGrowth: number;
  };
}
