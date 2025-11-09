export class TopContributor {
  id: string;
  name: string;
  email: string;
  department: string;
  hackathonsParticipated: number;
  challengesCompleted: number;
  totalSubmissions: number;
  averageScore: number;
  badges: number;
}

export class TopContributorsResponseDto {
  topContributors: TopContributor[];
  mostActiveUsers: TopContributor[];
  topScorers: TopContributor[];
}
