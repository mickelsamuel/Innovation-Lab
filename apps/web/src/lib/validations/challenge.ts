/**
 * Challenge validation schemas using Zod
 */

import { z } from 'zod';
import {
  ChallengeStatus,
  ChallengeVisibility,
  RewardType,
  ChallengeSubmissionStatus,
} from '@/types/challenge';

/**
 * Slug validation helper
 */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Create Challenge Schema
 */
export const createChallengeSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(slugRegex, 'Slug must be lowercase letters, numbers, and hyphens only'),
  problemStatement: z
    .string()
    .min(100, 'Problem statement must be at least 100 characters')
    .max(10000, 'Problem statement must be less than 10000 characters'),
  ownerOrg: z.string().optional(),
  rewardType: z.nativeEnum(RewardType).optional(),
  rewardValue: z.string().optional(),
  categories: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  status: z.nativeEnum(ChallengeStatus).default(ChallengeStatus.DRAFT),
  visibility: z.nativeEnum(ChallengeVisibility).default(ChallengeVisibility.PUBLIC),
  deadlineAt: z.string().datetime().optional().or(z.literal('')),
});

export type CreateChallengeFormData = z.infer<typeof createChallengeSchema>;

/**
 * Update Challenge Schema
 */
export const updateChallengeSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(slugRegex, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(),
  problemStatement: z
    .string()
    .min(100, 'Problem statement must be at least 100 characters')
    .max(10000, 'Problem statement must be less than 10000 characters')
    .optional(),
  ownerOrg: z.string().optional(),
  rewardType: z.nativeEnum(RewardType).optional(),
  rewardValue: z.string().optional(),
  categories: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  status: z.nativeEnum(ChallengeStatus).optional(),
  visibility: z.nativeEnum(ChallengeVisibility).optional(),
  deadlineAt: z.string().datetime().optional().or(z.literal('')),
});

export type UpdateChallengeFormData = z.infer<typeof updateChallengeSchema>;

/**
 * Review Submission Schema
 */
export const reviewSubmissionSchema = z.object({
  status: z.nativeEnum(ChallengeSubmissionStatus),
  score: z
    .number()
    .min(0, 'Score must be at least 0')
    .max(100, 'Score must be at most 100')
    .optional(),
  feedback: z
    .string()
    .max(5000, 'Feedback must be less than 5000 characters')
    .optional(),
});

export type ReviewSubmissionFormData = z.infer<typeof reviewSubmissionSchema>;

/**
 * Helper function to generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
