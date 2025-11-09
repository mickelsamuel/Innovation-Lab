/**
 * Gamification-related TypeScript types
 */

export enum LeaderboardScope {
  GLOBAL = 'GLOBAL',
  HACKATHON = 'HACKATHON',
  CHALLENGE = 'CHALLENGE',
}

export enum LeaderboardPeriod {
  ALLTIME = 'ALLTIME',
  SEASON = 'SEASON',
  MONTH = 'MONTH',
  WEEK = 'WEEK',
}

export interface GamificationProfile {
  userId: string;
  xp: number;
  level: number;
  streakDays: number;
  vaultKeys: number;
  badges: string[];
  xpToNextLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  recentXpEvents: XpEvent[];
}

export interface XpEvent {
  id: string;
  userId: string;
  eventType: string;
  points: number;
  refType?: string;
  refId?: string;
  metadata?: any;
  createdAt: string;
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
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  xpRequired: number;
  rarity: string;
  createdAt: string;
}

export interface LeaderboardFilters {
  scope?: LeaderboardScope;
  period?: LeaderboardPeriod;
  scopeId?: string;
  limit?: number;
}
