import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional, IsEnum, IsObject } from 'class-validator';
import { LeaderboardScope, LeaderboardPeriod } from '@prisma/client';

/**
 * DTO for awarding XP (admin/internal use)
 */
export class AwardXpDto {
  @ApiProperty({ description: 'User ID to award XP to' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Event type (e.g., "SUBMIT_PROJECT")' })
  @IsString()
  eventType: string;

  @ApiProperty({ description: 'Points to award', minimum: 1 })
  @IsInt()
  @Min(1)
  points: number;

  @ApiPropertyOptional({ description: 'Reference type (e.g., "hackathon")' })
  @IsString()
  @IsOptional()
  refType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsString()
  @IsOptional()
  refId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', type: 'object' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

/**
 * DTO for awarding badge (admin use)
 */
export class AwardBadgeDto {
  @ApiProperty({ description: 'User ID to award badge to' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Badge slug (e.g., "first-win")' })
  @IsString()
  badgeSlug: string;
}

/**
 * DTO for creating badge (admin use)
 */
export class CreateBadgeDto {
  @ApiProperty({ description: 'Unique badge slug', example: 'first-win' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Badge name', example: 'First Victory' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Badge description',
    example: 'Won your first hackathon',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Badge icon (emoji or URL)',
    example: '🏆',
  })
  @IsString()
  icon: string;

  @ApiPropertyOptional({
    description: 'XP required to unlock',
    minimum: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  xpRequired?: number;

  @ApiPropertyOptional({
    description: 'Badge rarity',
    example: 'rare',
    default: 'common',
  })
  @IsString()
  @IsOptional()
  rarity?: string;
}

/**
 * Query parameters for leaderboard
 */
export class GetLeaderboardDto {
  @ApiPropertyOptional({
    description: 'Leaderboard scope',
    enum: LeaderboardScope,
    default: LeaderboardScope.GLOBAL,
  })
  @IsEnum(LeaderboardScope)
  @IsOptional()
  scope?: LeaderboardScope = LeaderboardScope.GLOBAL;

  @ApiPropertyOptional({
    description: 'Time period',
    enum: LeaderboardPeriod,
    default: LeaderboardPeriod.ALLTIME,
  })
  @IsEnum(LeaderboardPeriod)
  @IsOptional()
  period?: LeaderboardPeriod = LeaderboardPeriod.ALLTIME;

  @ApiPropertyOptional({
    description: 'Scope ID (e.g., hackathon ID)',
  })
  @IsString()
  @IsOptional()
  scopeId?: string;

  @ApiPropertyOptional({
    description: 'Number of entries to return',
    minimum: 1,
    default: 100,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 100;
}

/**
 * Response DTO for user profile
 */
export class GamificationProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Total experience points' })
  xp: number;

  @ApiProperty({ description: 'Current level' })
  level: number;

  @ApiProperty({ description: 'Consecutive days active' })
  streakDays: number;

  @ApiProperty({ description: 'Vault keys collected' })
  vaultKeys: number;

  @ApiProperty({ description: 'Badge slugs earned', type: [String] })
  badges: string[];

  @ApiProperty({ description: 'XP needed for next level' })
  xpToNextLevel: number;

  @ApiProperty({ description: 'XP threshold for current level' })
  currentLevelXp: number;

  @ApiProperty({ description: 'XP threshold for next level' })
  nextLevelXp: number;

  @ApiProperty({
    description: 'Recent XP earning events',
    type: 'array',
    items: { type: 'object' },
  })
  recentXpEvents: Record<string, unknown>[];
}

/**
 * Response DTO for leaderboard entry
 */
export class LeaderboardEntryDto {
  @ApiProperty({ description: 'Rank position' })
  rank: number;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      name: { type: 'string' },
      handle: { type: 'string' },
      avatarUrl: { type: 'string' },
    },
  })
  user: {
    name: string;
    handle: string;
    avatarUrl?: string;
  };

  @ApiProperty({ description: 'Total XP' })
  xp: number;

  @ApiProperty({ description: 'Level' })
  level: number;

  @ApiProperty({ description: 'Badge slugs', type: [String] })
  badges: string[];
}

/**
 * Response DTO for XP event
 */
export class XpEventDto {
  @ApiProperty({ description: 'Event ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Event type' })
  eventType: string;

  @ApiProperty({ description: 'Points awarded' })
  points: number;

  @ApiPropertyOptional({ description: 'Reference type' })
  refType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  refId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: Record<string, unknown>;

  @ApiProperty({ description: 'Event timestamp' })
  createdAt: Date;
}

/**
 * Response DTO for badge
 */
export class BadgeDto {
  @ApiProperty({ description: 'Badge ID' })
  id: string;

  @ApiProperty({ description: 'Badge slug' })
  slug: string;

  @ApiProperty({ description: 'Badge name' })
  name: string;

  @ApiProperty({ description: 'Badge description' })
  description: string;

  @ApiProperty({ description: 'Badge icon' })
  icon: string;

  @ApiProperty({ description: 'XP required to unlock' })
  xpRequired: number;

  @ApiProperty({ description: 'Badge rarity' })
  rarity: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}
