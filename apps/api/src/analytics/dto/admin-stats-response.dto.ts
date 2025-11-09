import { ApiProperty } from '@nestjs/swagger';

export class AdminStatsResponseDto {
  @ApiProperty({ description: 'Total number of hackathons' })
  totalHackathons: number;

  @ApiProperty({ description: 'Hackathons created this month' })
  hackathonsThisMonth: number;

  @ApiProperty({ description: 'Number of active (LIVE) hackathons' })
  activeHackathons: number;

  @ApiProperty({ description: 'Total number of challenges' })
  totalChallenges: number;

  @ApiProperty({ description: 'Challenges created this week' })
  challengesThisWeek: number;

  @ApiProperty({ description: 'Number of active (OPEN) challenges' })
  activeChallenges: number;

  @ApiProperty({ description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ description: 'Users created this week' })
  usersThisWeek: number;

  @ApiProperty({ description: 'Total number of submissions' })
  totalSubmissions: number;

  @ApiProperty({ description: 'Number of pending challenge reviews' })
  pendingReviews: number;
}
