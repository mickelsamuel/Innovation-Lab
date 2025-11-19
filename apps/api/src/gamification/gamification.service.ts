import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LeaderboardScope, LeaderboardPeriod, Prisma } from '@prisma/client';

// XP Points for different actions
export const XP_POINTS = {
  // Hackathon actions
  JOIN_HACKATHON: 10,
  SUBMIT_PROJECT: 50,
  FINALIZE_SUBMISSION: 25,
  WIN_HACKATHON_1ST: 500,
  WIN_HACKATHON_2ND: 300,
  WIN_HACKATHON_3RD: 200,
  RECEIVE_JUDGE_SCORE: 10, // per judge

  // Challenge actions
  SUBMIT_CHALLENGE_SOLUTION: 30,
  CHALLENGE_ACCEPTED: 100,
  CHALLENGE_WINNER: 300,

  // Team actions
  CREATE_TEAM: 15,
  JOIN_TEAM: 10,

  // Engagement
  DAILY_LOGIN: 5,
  STREAK_BONUS_7DAYS: 50,
  STREAK_BONUS_30DAYS: 200,
  FIRST_PROJECT: 100,
  FIRST_CHALLENGE: 50,
} as const;

// Level thresholds - Progressive XP curve
export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  1000, // Level 5
  2000, // Level 6
  3500, // Level 7
  5500, // Level 8
  8000, // Level 9
  11000, // Level 10
  15000, // Level 11
  20000, // Level 12
  26000, // Level 13
  33000, // Level 14
  41000, // Level 15
  50000, // Level 16
  60000, // Level 17
  72000, // Level 18
  85000, // Level 19
  100000, // Level 20
  120000, // Level 21
  145000, // Level 22
  175000, // Level 23
  210000, // Level 24
  250000, // Level 25
  300000, // Level 26
  360000, // Level 27
  430000, // Level 28
  510000, // Level 29
  600000, // Level 30
  750000, // Level 31+
];

export interface UserGamificationProfile {
  userId: string;
  xp: number;
  level: number;
  streakDays: number;
  vaultKeys: number;
  badges: string[];
  xpToNextLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  recentXpEvents: XpEventSummary[];
}

export interface XpEventSummary {
  id: string;
  eventType: string;
  points: number;
  refType?: string;
  refId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: {
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  xp: number;
  level: number;
  badges: string[];
  topBadges?: Array<{
    slug: string;
    name: string;
    icon: string;
    rarity: string;
  }>;
}

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create user's gamification profile
   */
  async getUserProfile(userId: string): Promise<UserGamificationProfile> {
    let profile = await this.prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    // Create profile if doesn't exist
    if (!profile) {
      profile = await this.prisma.gamificationProfile.create({
        data: {
          userId,
          xp: 0,
          level: 1,
          streakDays: 0,
          vaultKeys: 0,
          badges: [],
        },
      });
    }

    // Get recent XP events
    const recentEvents = await this.prisma.xpEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate XP to next level
    const levelData = this.calculateLevelProgress(profile.xp);

    return {
      userId: profile.userId,
      xp: profile.xp,
      level: profile.level,
      streakDays: profile.streakDays,
      vaultKeys: profile.vaultKeys,
      badges: profile.badges,
      xpToNextLevel: levelData.xpToNextLevel,
      currentLevelXp: levelData.currentLevelXp,
      nextLevelXp: levelData.nextLevelXp,
      recentXpEvents: recentEvents.map(event => ({
        id: event.id,
        eventType: event.eventType,
        points: event.points,
        refType: event.refType || undefined,
        refId: event.refId || undefined,
        metadata: event.metadata as Record<string, unknown> | undefined,
        createdAt: event.createdAt,
      })),
    };
  }

  /**
   * Award XP to user for an action
   */
  async awardXp(
    userId: string,
    eventType: string,
    points: number,
    refType?: string,
    refId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    // Create XP event
    await this.prisma.xpEvent.create({
      data: {
        userId,
        eventType,
        points,
        refType,
        refId,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });

    // Get or create profile
    let profile = await this.prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.gamificationProfile.create({
        data: {
          userId,
          xp: 0,
          level: 1,
        },
      });
    }

    // Update XP
    const newXp = profile.xp + points;
    const newLevel = this.calculateLevel(newXp);

    await this.prisma.gamificationProfile.update({
      where: { userId },
      data: {
        xp: newXp,
        level: newLevel,
        lastActivityAt: new Date(),
      },
    });

    // Check for level-up badges
    if (newLevel > profile.level) {
      await this.checkAndAwardLevelBadges(userId, newLevel);
    }
  }

  /**
   * Award badge to user
   */
  async awardBadge(userId: string, badgeSlug: string): Promise<void> {
    const profile = await this.prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Gamification profile not found');
    }

    // Check if user already has badge
    if (profile.badges.includes(badgeSlug)) {
      return; // Already has badge
    }

    // Add badge
    await this.prisma.gamificationProfile.update({
      where: { userId },
      data: {
        badges: {
          push: badgeSlug,
        },
      },
    });
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    _scope: LeaderboardScope = LeaderboardScope.GLOBAL,
    _period: LeaderboardPeriod = LeaderboardPeriod.ALLTIME,
    _scopeId?: string,
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    // For now, we'll generate real-time leaderboard
    // In production, use LeaderboardSnapshot for caching
    const profiles = await this.prisma.gamificationProfile.findMany({
      orderBy: { xp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Fetch all badges for badge details
    const allBadges = await this.prisma.badge.findMany();
    const badgeMap = new Map(allBadges.map(b => [b.slug, b]));

    // Define rarity weights for sorting (higher = better)
    const rarityWeight: Record<string, number> = {
      'legendary': 5,
      'epic': 4,
      'rare': 3,
      'uncommon': 2,
      'common': 1,
    };

    return profiles.map((profile, index) => {
      // Get full badge details for user's badges
      const userBadgeDetails = profile.badges
        .map(slug => badgeMap.get(slug))
        .filter((badge): badge is typeof allBadges[0] => badge !== undefined)
        .sort((a, b) => {
          // Sort by rarity (highest first)
          const weightA = rarityWeight[a.rarity.toLowerCase()] || 0;
          const weightB = rarityWeight[b.rarity.toLowerCase()] || 0;
          return weightB - weightA;
        })
        .slice(0, 3) // Take top 3
        .map(badge => ({
          slug: badge.slug,
          name: badge.name,
          icon: badge.icon,
          rarity: badge.rarity,
        }));

      return {
        rank: index + 1,
        userId: profile.userId,
        user: {
          name: profile.user.name || 'Anonymous',
          handle: profile.user.handle || 'unknown',
          avatarUrl: profile.user.avatarUrl || undefined,
        },
        xp: profile.xp,
        level: profile.level,
        badges: profile.badges,
        topBadges: userBadgeDetails,
      };
    });
  }

  /**
   * Get all available badges
   */
  async getAllBadges() {
    return this.prisma.badge.findMany({
      orderBy: [{ xpRequired: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Create new badge (admin only)
   */
  async createBadge(data: {
    slug: string;
    name: string;
    description: string;
    icon: string;
    xpRequired?: number;
    rarity?: string;
  }) {
    return this.prisma.badge.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        icon: data.icon,
        xpRequired: data.xpRequired || 0,
        rarity: data.rarity || 'common',
      },
    });
  }

  /**
   * Get user's XP events history
   */
  async getUserXpEvents(userId: string, limit: number = 50) {
    return this.prisma.xpEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Calculate user's level from XP
   */
  private calculateLevel(xp: number): number {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }
    return level;
  }

  /**
   * Calculate level progress
   */
  private calculateLevelProgress(xp: number): {
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    xpToNextLevel: number;
  } {
    const level = this.calculateLevel(xp);
    const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextLevelXp = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const xpToNextLevel = nextLevelXp - xp;

    return {
      level,
      currentLevelXp,
      nextLevelXp,
      xpToNextLevel: xpToNextLevel > 0 ? xpToNextLevel : 0,
    };
  }

  /**
   * Check and award level-based badges
   */
  private async checkAndAwardLevelBadges(userId: string, newLevel: number): Promise<void> {
    const levelBadges: Record<number, string> = {
      5: 'level-5',
      10: 'level-10',
      15: 'level-15',
      20: 'level-20',
      25: 'level-25',
      30: 'level-30',
    };

    const badgeSlug = levelBadges[newLevel];
    if (badgeSlug) {
      await this.awardBadge(userId, badgeSlug);
    }
  }

  /**
   * Update daily streak
   */
  async updateDailyStreak(userId: string): Promise<void> {
    const profile = await this.prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) return;

    const now = new Date();
    const lastActivity = profile.lastActivityAt;

    if (!lastActivity) {
      // First activity
      await this.prisma.gamificationProfile.update({
        where: { userId },
        data: {
          streakDays: 1,
          lastActivityAt: now,
        },
      });
      await this.awardXp(userId, 'DAILY_LOGIN', XP_POINTS.DAILY_LOGIN);
      return;
    }

    const daysSinceLastActivity = Math.floor(
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity === 0) {
      // Same day, no streak update
      return;
    } else if (daysSinceLastActivity === 1) {
      // Consecutive day - increment streak
      const newStreak = profile.streakDays + 1;
      await this.prisma.gamificationProfile.update({
        where: { userId },
        data: {
          streakDays: newStreak,
          lastActivityAt: now,
        },
      });
      await this.awardXp(userId, 'DAILY_LOGIN', XP_POINTS.DAILY_LOGIN);

      // Streak bonuses
      if (newStreak === 7) {
        await this.awardXp(userId, 'STREAK_BONUS_7DAYS', XP_POINTS.STREAK_BONUS_7DAYS);
        await this.awardBadge(userId, 'streak-7');
      } else if (newStreak === 30) {
        await this.awardXp(userId, 'STREAK_BONUS_30DAYS', XP_POINTS.STREAK_BONUS_30DAYS);
        await this.awardBadge(userId, 'streak-30');
      }
    } else {
      // Streak broken - reset to 1
      await this.prisma.gamificationProfile.update({
        where: { userId },
        data: {
          streakDays: 1,
          lastActivityAt: now,
        },
      });
      await this.awardXp(userId, 'DAILY_LOGIN', XP_POINTS.DAILY_LOGIN);
    }
  }

  /**
   * Delete badge
   */
  async deleteBadge(badgeId: string): Promise<void> {
    const badge = await this.prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) {
      throw new NotFoundException('Badge not found');
    }

    await this.prisma.badge.delete({
      where: { id: badgeId },
    });
  }

  /**
   * Get user's earned badges with full details
   */
  async getUserBadges(userId: string): Promise<unknown[]> {
    const profile = await this.prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.badges || profile.badges.length === 0) {
      return [];
    }

    // Fetch full badge details for user's earned badges
    const badges = await this.prisma.badge.findMany({
      where: {
        slug: {
          in: profile.badges,
        },
      },
    });

    return badges;
  }
}
