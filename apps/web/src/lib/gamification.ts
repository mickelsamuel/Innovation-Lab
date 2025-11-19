/**
 * Gamification API client functions
 */

import { apiFetch, buildQueryString } from './api';
import type {
  GamificationProfile,
  LeaderboardEntry,
  Badge,
  XpEvent,
  LeaderboardFilters,
} from '@/types/gamification';

/**
 * Get current user's gamification profile
 */
export async function getMyGamificationProfile(token: string): Promise<GamificationProfile> {
  return apiFetch<GamificationProfile>('/gamification/profile', { token });
}

/**
 * Get user's gamification profile by ID
 */
export async function getUserGamificationProfile(userId: string): Promise<GamificationProfile> {
  return apiFetch<GamificationProfile>(`/gamification/profile/${userId}`);
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  filters: LeaderboardFilters = {}
): Promise<LeaderboardEntry[]> {
  const queryString = buildQueryString(filters);
  return apiFetch<LeaderboardEntry[]>(`/gamification/leaderboard${queryString}`);
}

/**
 * Get all available badges
 */
export async function getAllBadges(): Promise<Badge[]> {
  return apiFetch<Badge[]>('/gamification/badges');
}

/**
 * Get current user's XP events
 */
export async function getMyXpEvents(token: string, limit: number = 50): Promise<XpEvent[]> {
  const queryString = buildQueryString({ limit });
  return apiFetch<XpEvent[]>(`/gamification/xp-events${queryString}`, {
    token,
  });
}

/**
 * Get user's XP events by ID
 */
export async function getUserXpEvents(userId: string, limit: number = 50): Promise<XpEvent[]> {
  const queryString = buildQueryString({ limit });
  return apiFetch<XpEvent[]>(`/gamification/xp-events/${userId}${queryString}`);
}

/**
 * Update daily streak (called on user activity)
 */
export async function updateDailyStreak(token: string): Promise<void> {
  await apiFetch('/gamification/update-streak', {
    method: 'POST',
    token,
  });
}

/**
 * Get level display name
 */
export function getLevelName(level: number): string {
  const levelNames: Record<number, string> = {
    1: 'Novice',
    2: 'Beginner',
    3: 'Apprentice',
    4: 'Intermediate',
    5: 'Advanced',
    6: 'Expert',
    7: 'Master',
    8: 'Grandmaster',
    9: 'Legend',
    10: 'Mythic',
  };

  if (level >= 10) return levelNames[10];
  return levelNames[level] || `Level ${level}`;
}

/**
 * Get rarity color class
 */
export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'text-slate-600 dark:text-slate-300',
    uncommon: 'text-green-600 dark:text-green-400',
    rare: 'text-blue-600 dark:text-blue-400',
    epic: 'text-purple-600 dark:text-purple-400',
    legendary: 'text-accent',
  };
  return colors[rarity] || colors.common;
}

/**
 * Get rarity background class
 */
export function getRarityBgColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    uncommon: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
    rare: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
    epic: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700',
    legendary: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-700',
  };
  return colors[rarity.toLowerCase()] || colors.common;
}

/**
 * Get event type display name
 */
export function getEventTypeName(eventType: string): string {
  const names: Record<string, string> = {
    JOIN_HACKATHON: 'Joined Hackathon',
    SUBMIT_PROJECT: 'Submitted Project',
    FINALIZE_SUBMISSION: 'Finalized Submission',
    WIN_HACKATHON_1ST: '🥇 1st Place',
    WIN_HACKATHON_2ND: '🥈 2nd Place',
    WIN_HACKATHON_3RD: '🥉 3rd Place',
    RECEIVE_JUDGE_SCORE: 'Received Judge Score',
    SUBMIT_CHALLENGE_SOLUTION: 'Submitted Challenge Solution',
    CHALLENGE_ACCEPTED: 'Challenge Solution Accepted',
    CHALLENGE_WINNER: '🏆 Challenge Winner',
    CREATE_TEAM: 'Created Team',
    JOIN_TEAM: 'Joined Team',
    DAILY_LOGIN: 'Daily Login',
    STREAK_BONUS_7DAYS: '🔥 7-Day Streak Bonus',
    STREAK_BONUS_30DAYS: '🔥 30-Day Streak Bonus',
    FIRST_PROJECT: 'First Project',
    FIRST_CHALLENGE: 'First Challenge',
  };
  return names[eventType] || eventType.replace(/_/g, ' ');
}

/**
 * Calculate progress percentage
 */
export function calculateProgressPercentage(
  currentXp: number,
  currentLevelXp: number,
  nextLevelXp: number
): number {
  const xpInCurrentLevel = currentXp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  return Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
}

/**
 * Format XP with commas
 */
export function formatXp(xp: number): string {
  return xp.toLocaleString();
}
