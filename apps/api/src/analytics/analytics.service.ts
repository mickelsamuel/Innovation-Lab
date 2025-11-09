import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  AnalyticsFilterDto,
  TimeRange,
  PlatformStatsResponseDto,
  GrowthMetricsResponseDto,
  GrowthDataPoint,
  EngagementMetricsResponseDto,
  TopContributorsResponseDto,
  TopContributor,
  HackathonAnalyticsResponseDto,
  ChallengeAnalyticsResponseDto,
  DepartmentStatsResponseDto,
  AdminStatsResponseDto,
} from './dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformStats(): Promise<PlatformStatsResponseDto> {
    const [
      totalUsers,
      activeUsers,
      hackathonStats,
      challengeStats,
      teamStats,
      submissionStats,
      departmentStats,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count({ where: { isActive: true, isBanned: false } }),

      // Active users (logged in last 30 days)
      this.prisma.user.count({
        where: {
          isActive: true,
          isBanned: false,
          lastLoginAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),

      // Hackathon stats
      this.prisma.hackathon.aggregate({
        _count: true,
        where: {
          OR: [
            { status: 'UPCOMING' },
            { status: 'LIVE' },
            { status: 'JUDGING' },
          ],
        },
      }),

      // Challenge stats
      this.prisma.challenge.aggregate({
        _count: true,
        where: { status: 'OPEN' },
      }),

      // Team stats
      this.prisma.team.aggregate({
        _count: true,
      }),

      // Submission stats
      this.prisma.submission.count(),

      // Department distribution
      this.prisma.user.groupBy({
        by: ['organization'],
        _count: true,
        where: {
          isActive: true,
          isBanned: false,
          organization: { not: null },
        },
        orderBy: { _count: { organization: 'desc' } },
        take: 10,
      }),
    ]);

    // Calculate average team size
    const teamMemberCounts = await this.prisma.teamMember.groupBy({
      by: ['teamId'],
      _count: true,
    });
    const averageTeamSize =
      teamMemberCounts.length > 0
        ? teamMemberCounts.reduce((sum: number, t) => sum + t._count, 0) /
          teamMemberCounts.length
        : 0;

    // Calculate total hackathons and challenges
    const totalHackathons = await this.prisma.hackathon.count();
    const totalChallenges = await this.prisma.challenge.count();

    // Process department stats
    const totalDeptUsers = departmentStats.reduce(
      (sum: number, d) => sum + d._count,
      0,
    );
    const topDepartments = departmentStats.map((dept) => ({
      department: dept.organization || 'Unknown',
      count: dept._count,
      percentage: totalDeptUsers > 0 ? (dept._count / totalDeptUsers) * 100 : 0,
    }));

    return {
      totalUsers,
      activeUsers,
      totalHackathons,
      activeHackathons: hackathonStats._count,
      totalChallenges,
      activeChallenges: challengeStats._count,
      totalSubmissions: submissionStats,
      totalTeams: teamStats._count,
      averageTeamSize: Math.round(averageTeamSize * 10) / 10,
      topDepartments,
    };
  }

  async getAdminStats(): Promise<AdminStatsResponseDto> {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalHackathons,
      hackathonsThisMonth,
      activeHackathons,
      totalChallenges,
      challengesThisWeek,
      activeChallenges,
      totalUsers,
      usersThisWeek,
      totalSubmissions,
      pendingReviews,
    ] = await Promise.all([
      // Total hackathons
      this.prisma.hackathon.count(),

      // Hackathons created this month
      this.prisma.hackathon.count({
        where: { createdAt: { gte: monthAgo } },
      }),

      // Active hackathons
      this.prisma.hackathon.count({
        where: { status: 'LIVE' },
      }),

      // Total challenges
      this.prisma.challenge.count(),

      // Challenges created this week
      this.prisma.challenge.count({
        where: { createdAt: { gte: weekAgo } },
      }),

      // Active challenges
      this.prisma.challenge.count({
        where: { status: 'OPEN' },
      }),

      // Total users
      this.prisma.user.count({ where: { isActive: true, isBanned: false } }),

      // Users created this week
      this.prisma.user.count({
        where: { createdAt: { gte: weekAgo }, isActive: true, isBanned: false },
      }),

      // Total submissions
      this.prisma.submission.count(),

      // Pending challenge reviews
      this.prisma.challengeSubmission.count({
        where: { status: 'UNDER_REVIEW' },
      }),
    ]);

    return {
      totalHackathons,
      hackathonsThisMonth,
      activeHackathons,
      totalChallenges,
      challengesThisWeek,
      activeChallenges,
      totalUsers,
      usersThisWeek,
      totalSubmissions,
      pendingReviews,
    };
  }

  async getGrowthMetrics(
    filter: AnalyticsFilterDto,
  ): Promise<GrowthMetricsResponseDto> {
    const { timeRange = TimeRange.MONTH } = filter;
    const { startDate, endDate, interval } = this.getDateRange(timeRange);

    const dataPoints: GrowthDataPoint[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const nextDate = this.getNextInterval(currentDate, interval);

      const [users, hackathons, challenges, submissions] = await Promise.all([
        this.prisma.user.count({
          where: {
            createdAt: { gte: startDate, lte: currentDate },
            isActive: true,
          },
        }),
        this.prisma.hackathon.count({
          where: { createdAt: { gte: startDate, lte: currentDate } },
        }),
        this.prisma.challenge.count({
          where: { createdAt: { gte: startDate, lte: currentDate } },
        }),
        this.prisma.submission.count({
          where: { createdAt: { gte: startDate, lte: currentDate } },
        }),
      ]);

      dataPoints.push({
        date: currentDate.toISOString().split('T')[0],
        users,
        hackathons,
        challenges,
        submissions,
      });

      currentDate = nextDate;
    }

    // Calculate trends (percentage growth)
    const trends = {
      userGrowth: this.calculateGrowth(dataPoints, 'users'),
      hackathonGrowth: this.calculateGrowth(dataPoints, 'hackathons'),
      challengeGrowth: this.calculateGrowth(dataPoints, 'challenges'),
      submissionGrowth: this.calculateGrowth(dataPoints, 'submissions'),
    };

    return {
      period: timeRange,
      dataPoints,
      trends,
    };
  }

  async getEngagementMetrics(): Promise<EngagementMetricsResponseDto> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      activeUsersToday,
      activeUsersThisWeek,
      activeUsersThisMonth,
      totalSubmissions,
      totalHackathons,
      totalUsers,
      repeatParticipants,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { lastLoginAt: { gte: today } },
      }),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: weekAgo } },
      }),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: monthAgo } },
      }),
      this.prisma.submission.count(),
      this.prisma.hackathon.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.teamMember.groupBy({
        by: ['userId'],
        _count: true,
        having: { userId: { _count: { gt: 1 } } },
      }),
    ]);

    // Activity by day of week (last 7 days)
    const activityByDay = await this.getActivityByDay(weekAgo);

    // Activity by hour (last 24 hours)
    const activityByHour = await this.getActivityByHour(today);

    const submissionsPerHackathon =
      totalHackathons > 0
        ? Math.round((totalSubmissions / totalHackathons) * 10) / 10
        : 0;

    const participationRate =
      totalUsers > 0
        ? Math.round(
            (repeatParticipants.length / totalUsers) * 100 * 10,
          ) / 10
        : 0;

    return {
      activeUsersToday,
      activeUsersThisWeek,
      activeUsersThisMonth,
      averageSessionDuration: 0, // Would require session tracking
      submissionsPerHackathon,
      participationRate,
      repeatParticipants: repeatParticipants.length,
      activityByDay,
      activityByHour,
    };
  }

  async getTopContributors(
    limit: number = 10,
  ): Promise<TopContributorsResponseDto> {
    // Get users with their participation stats
    const users = await this.prisma.user.findMany({
      where: { isActive: true, isBanned: false },
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        teamMemberships: {
          select: {
            team: {
              select: {
                hackathonId: true,
              },
            },
          },
        },
        challengeSubmissions: {
          select: {
            score: true,
            status: true,
          },
        },
        gamificationProfile: {
          select: {
            xp: true,
            badges: true,
          },
        },
      },
    });

    const contributors: TopContributor[] = users.map((user) => {
      const hackathonsParticipated = new Set(
        user.teamMemberships.map((tm) => tm.team.hackathonId),
      ).size;

      const challengesCompleted = user.challengeSubmissions.filter(
        (cs) => cs.status === 'ACCEPTED' || cs.status === 'WINNER',
      ).length;

      const totalSubmissions = user.challengeSubmissions.length;

      const scores = user.challengeSubmissions
        .filter((cs) => cs.score)
        .map((cs) => Number(cs.score));

      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s, 0) / scores.length
          : 0;

      return {
        id: user.id,
        name: user.name || 'Anonymous',
        email: user.email,
        department: user.organization || 'Unknown',
        hackathonsParticipated,
        challengesCompleted,
        totalSubmissions,
        averageScore: Math.round(averageScore * 10) / 10,
        badges: user.gamificationProfile?.badges.length || 0,
      };
    });

    // Sort by different criteria
    const topContributors = [...contributors]
      .sort((a, b) => b.totalSubmissions - a.totalSubmissions)
      .slice(0, limit);

    const mostActiveUsers = [...contributors]
      .sort(
        (a, b) =>
          b.hackathonsParticipated +
          b.challengesCompleted -
          (a.hackathonsParticipated + a.challengesCompleted),
      )
      .slice(0, limit);

    const topScorers = [...contributors]
      .filter((c) => c.averageScore > 0)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, limit);

    return {
      topContributors,
      mostActiveUsers,
      topScorers,
    };
  }

  async getHackathonAnalytics(
    hackathonId: string,
  ): Promise<HackathonAnalyticsResponseDto> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        teams: {
          include: {
            members: true,
            submissions: {
              include: {
                scores: true,
              },
            },
          },
        },
        judges: true,
      },
    });

    if (!hackathon) {
      throw new Error('Hackathon not found');
    }

    const totalRegistrations = hackathon.teams.reduce(
      (sum, team) => sum + team.members.length,
      0,
    );
    const totalTeams = hackathon.teams.length;
    const teamsWithSubmissions = hackathon.teams.filter(
      (t) => t.submissions.length > 0,
    );
    const totalSubmissions = teamsWithSubmissions.length;

    const completionRate =
      totalTeams > 0 ? (totalSubmissions / totalTeams) * 100 : 0;

    const averageTeamSize =
      totalTeams > 0 ? totalRegistrations / totalTeams : 0;

    // Registration funnel
    const teamsWithMembers = hackathon.teams.filter(
      (t) => t.members.length > 0,
    );
    const submissionsJudged = hackathon.teams.filter(
      (t) => t.submissions.length > 0 && t.submissions[0].scores.length > 0,
    ).length;

    const registrationFunnel = {
      registered: totalRegistrations,
      formedTeam: teamsWithMembers.length,
      submitted: totalSubmissions,
      judged: submissionsJudged,
    };

    // Submission timeline
    const submissionTimeline = await this.getSubmissionTimeline(hackathonId);

    // Department distribution
    const departmentDistribution = await this.getDepartmentDistribution(
      hackathonId,
    );

    // Score distribution
    const scoreDistribution = this.getScoreDistribution(hackathon.teams);

    // Judge progress
    const totalJudges = hackathon.judges.length;
    const allSubmissions = hackathon.teams.flatMap((t) => t.submissions);
    const submissionsWithScores = allSubmissions.filter(
      (s) => s.scores.length > 0,
    );
    const activeJudges = new Set(
      submissionsWithScores.flatMap((s) => s.scores.map((sc) => sc.judgeId)),
    ).size;

    const judgeProgress = {
      totalJudges,
      activeJudges,
      submissionsJudged: submissionsWithScores.length,
      submissionsPending: allSubmissions.length - submissionsWithScores.length,
      averageJudgingTime: 0, // Would require timestamp tracking
    };

    // Top teams
    const topTeams = hackathon.teams
      .filter((t) => t.submissions.length > 0 && t.submissions[0].scoreAggregate)
      .map((team) => ({
        teamId: team.id,
        teamName: team.name,
        score: Number(team.submissions[0].scoreAggregate),
        members: team.members.length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      hackathonId: hackathon.id,
      hackathonName: hackathon.title,
      status: hackathon.status,
      totalRegistrations,
      totalTeams,
      totalSubmissions,
      completionRate: Math.round(completionRate * 10) / 10,
      averageTeamSize: Math.round(averageTeamSize * 10) / 10,
      registrationFunnel,
      submissionTimeline,
      departmentDistribution,
      scoreDistribution,
      judgeProgress,
      topTeams,
    };
  }

  async getChallengeAnalytics(
    challengeId: string,
  ): Promise<ChallengeAnalyticsResponseDto> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const totalAttempts = challenge.submissions.length;
    const submittedSubmissions = challenge.submissions.filter(
      (s) => s.status !== 'SUBMITTED',
    );
    const acceptedSubmissions = challenge.submissions.filter(
      (s) => s.status === 'ACCEPTED' || s.status === 'WINNER',
    );

    const acceptanceRate =
      submittedSubmissions.length > 0
        ? (acceptedSubmissions.length / submittedSubmissions.length) * 100
        : 0;

    const scores = challenge.submissions
      .filter((s) => s.score)
      .map((s) => Number(s.score));
    const averageScore =
      scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;

    // Calculate average review time
    const reviewedSubmissions = challenge.submissions.filter(
      (s) => s.status !== 'SUBMITTED' && s.updatedAt > s.createdAt,
    );
    const reviewTimes = reviewedSubmissions.map(
      (s) => s.updatedAt.getTime() - s.createdAt.getTime(),
    );
    const averageReviewTime =
      reviewTimes.length > 0
        ? reviewTimes.reduce((sum, t) => sum + t, 0) / reviewTimes.length / (1000 * 60 * 60)
        : 0;

    // Submission trend (last 30 days)
    const submissionTrend = await this.getChallengeSubmissionTrend(challengeId);

    // Top performers
    const topPerformers = challenge.submissions
      .filter((s) => s.score && s.user)
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, 10)
      .map((s) => ({
        userId: s.user!.id,
        userName: s.user!.name || 'Anonymous',
        score: Number(s.score),
        submittedAt: s.createdAt.toISOString(),
      }));

    return {
      challengeId: challenge.id,
      challengeSlug: challenge.slug,
      challengeName: challenge.title,
      category: challenge.categories[0] || 'General',
      difficulty: 'Medium', // Add difficulty field to schema if needed
      totalAttempts,
      totalSubmissions: submittedSubmissions.length,
      acceptedSubmissions: acceptedSubmissions.length,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      averageScore: Math.round(averageScore * 10) / 10,
      averageReviewTime: Math.round(averageReviewTime * 10) / 10,
      submissionTrend,
      topPerformers,
      difficultyPerception: {
        tooEasy: 0,
        justRight: 0,
        tooHard: 0,
      },
      categoryPerformance: {
        category: challenge.categories[0] || 'General',
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: Math.round(acceptanceRate * 10) / 10,
      },
    };
  }

  async getDepartmentStats(): Promise<DepartmentStatsResponseDto> {
    const departments = await this.prisma.user.groupBy({
      by: ['organization'],
      _count: true,
      where: {
        organization: { not: null },
        isActive: true,
      },
    });

    const departmentStatsPromises = departments.map(async (dept) => {
      const [activeUsers, hackathonParticipations, challengeSubmissions, scores] =
        await Promise.all([
          this.prisma.user.count({
            where: {
              organization: dept.organization,
              isActive: true,
              lastLoginAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          }),
          this.prisma.teamMember.count({
            where: {
              user: { organization: dept.organization },
            },
          }),
          this.prisma.challengeSubmission.count({
            where: {
              user: { organization: dept.organization },
            },
          }),
          this.prisma.challengeSubmission.aggregate({
            where: {
              user: { organization: dept.organization },
              score: { not: null },
            },
            _avg: { score: true },
          }),
        ]);

      const engagementRate =
        dept._count > 0 ? (activeUsers / dept._count) * 100 : 0;

      return {
        department: dept.organization || 'Unknown',
        totalUsers: dept._count,
        activeUsers,
        hackathonParticipations,
        challengeSubmissions,
        averageScore: Number(scores._avg.score) || 0,
        engagementRate: Math.round(engagementRate * 10) / 10,
      };
    });

    const departmentStats = await Promise.all(departmentStatsPromises);

    // Sort by engagement
    departmentStats.sort((a, b) => b.engagementRate - a.engagementRate);

    return {
      departments: departmentStats,
      totalDepartments: departments.length,
      mostActiveDepartment:
        departmentStats[0]?.department || 'None',
      leastActiveDepartment:
        departmentStats[departmentStats.length - 1]?.department || 'None',
    };
  }

  // Helper methods
  private getDateRange(timeRange: TimeRange): {
    startDate: Date;
    endDate: Date;
    interval: 'day' | 'week' | 'month';
  } {
    const endDate = new Date();
    let startDate: Date;
    let interval: 'day' | 'week' | 'month';

    switch (timeRange) {
      case TimeRange.WEEK:
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        interval = 'day';
        break;
      case TimeRange.MONTH:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        interval = 'day';
        break;
      case TimeRange.QUARTER:
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        interval = 'week';
        break;
      case TimeRange.YEAR:
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        interval = 'month';
        break;
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        interval = 'day';
    }

    return { startDate, endDate, interval };
  }

  private getNextInterval(
    date: Date,
    interval: 'day' | 'week' | 'month',
  ): Date {
    const next = new Date(date);
    switch (interval) {
      case 'day':
        next.setDate(next.getDate() + 1);
        break;
      case 'week':
        next.setDate(next.getDate() + 7);
        break;
      case 'month':
        next.setMonth(next.getMonth() + 1);
        break;
    }
    return next;
  }

  private calculateGrowth(
    dataPoints: GrowthDataPoint[],
    metric: keyof Omit<GrowthDataPoint, 'date'>,
  ): number {
    if (dataPoints.length < 2) return 0;

    const first = dataPoints[0][metric];
    const last = dataPoints[dataPoints.length - 1][metric];

    if (first === 0) return last > 0 ? 100 : 0;

    return Math.round(((last - first) / first) * 100 * 10) / 10;
  }

  private async getActivityByDay(
    since: Date,
  ): Promise<Array<{ day: string; activities: number }>> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityCounts = new Array(7).fill(0);

    const activities = await this.prisma.xpEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    activities.forEach((activity) => {
      const dayIndex = activity.createdAt.getDay();
      activityCounts[dayIndex]++;
    });

    return days.map((day, index) => ({
      day,
      activities: activityCounts[index],
    }));
  }

  private async getActivityByHour(
    since: Date,
  ): Promise<Array<{ hour: number; activities: number }>> {
    const hourCounts = new Array(24).fill(0);

    const activities = await this.prisma.xpEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    activities.forEach((activity) => {
      const hour = activity.createdAt.getHours();
      hourCounts[hour]++;
    });

    return hourCounts.map((count, hour) => ({ hour, activities: count }));
  }

  private async getSubmissionTimeline(
    hackathonId: string,
  ): Promise<Array<{ date: string; count: number }>> {
    const submissions = await this.prisma.submission.findMany({
      where: { hackathonId },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const timeline = new Map<string, number>();
    submissions.forEach((sub) => {
      const date = sub.createdAt.toISOString().split('T')[0];
      timeline.set(date, (timeline.get(date) || 0) + 1);
    });

    return Array.from(timeline.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  private async getDepartmentDistribution(
    hackathonId: string,
  ): Promise<Array<{ department: string; count: number; percentage: number }>> {
    const teams = await this.prisma.team.findMany({
      where: { hackathonId },
      include: {
        members: {
          include: {
            user: {
              select: { organization: true },
            },
          },
        },
      },
    });

    const deptCounts = new Map<string, number>();
    let total = 0;

    teams.forEach((team) => {
      team.members.forEach((member) => {
        const dept = member.user.organization || 'Unknown';
        deptCounts.set(dept, (deptCounts.get(dept) || 0) + 1);
        total++;
      });
    });

    return Array.from(deptCounts.entries())
      .map(([department, count]) => ({
        department,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private getScoreDistribution(teams: any[]): Array<{ range: string; count: number }> {
    const ranges = [
      { min: 0, max: 20, label: '0-20' },
      { min: 20, max: 40, label: '20-40' },
      { min: 40, max: 60, label: '40-60' },
      { min: 60, max: 80, label: '60-80' },
      { min: 80, max: 100, label: '80-100' },
    ];

    const distribution = ranges.map((range) => ({
      range: range.label,
      count: 0,
    }));

    teams.forEach((team) => {
      if (team.submissions.length > 0 && team.submissions[0].scoreAggregate) {
        const score = Number(team.submissions[0].scoreAggregate);
        const rangeIndex = ranges.findIndex(
          (r) => score >= r.min && score < r.max,
        );
        if (rangeIndex >= 0) {
          distribution[rangeIndex].count++;
        }
      }
    });

    return distribution;
  }

  private async getChallengeSubmissionTrend(
    challengeId: string,
  ): Promise<Array<{ date: string; submissions: number; accepted: number }>> {
    const submissions = await this.prisma.challengeSubmission.findMany({
      where: { challengeId },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const timeline = new Map<
      string,
      { submissions: number; accepted: number }
    >();

    submissions.forEach((sub) => {
      const date = sub.createdAt.toISOString().split('T')[0];
      const current = timeline.get(date) || { submissions: 0, accepted: 0 };
      current.submissions++;
      if (sub.status === 'ACCEPTED' || sub.status === 'WINNER') {
        current.accepted++;
      }
      timeline.set(date, current);
    });

    return Array.from(timeline.entries()).map(([date, data]) => ({
      date,
      submissions: data.submissions,
      accepted: data.accepted,
    }));
  }
}
