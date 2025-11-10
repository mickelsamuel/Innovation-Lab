import { z } from 'zod';
import { HackathonStatus, HackathonLocation } from '@/types/hackathon';

/**
 * URL validation schema
 */
const urlSchema = z.string().url('Must be a valid URL').optional().or(z.literal(''));

/**
 * Track validation schema
 */
export const trackSchema = z.object({
  title: z.string().min(3, 'Track title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Track description must be at least 10 characters').max(500),
  order: z.number().int().min(0),
});

/**
 * Judging Criterion validation schema
 */
export const criterionSchema = z.object({
  name: z.string().min(3, 'Criterion name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Criterion description must be at least 10 characters').max(500),
  maxScore: z
    .number()
    .int()
    .min(1, 'Max score must be at least 1')
    .max(100, 'Max score cannot exceed 100'),
  weight: z.number().min(0, 'Weight must be at least 0').max(1, 'Weight cannot exceed 1'),
  order: z.number().int().min(0),
});

/**
 * Create hackathon validation schema
 */
export const createHackathonSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    subtitle: z.string().max(300).optional().or(z.literal('')),
    description: z
      .string()
      .min(50, 'Description must be at least 50 characters')
      .max(10000)
      .optional()
      .or(z.literal('')),
    status: z.nativeEnum(HackathonStatus),
    location: z.nativeEnum(HackathonLocation),
    virtualUrl: urlSchema,
    venue: z.string().max(200).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    country: z.string().max(100).optional().or(z.literal('')),
    timezone: z.string().max(50).optional().or(z.literal('')),
    bannerUrl: urlSchema,
    logoUrl: urlSchema,
    startsAt: z.string().min(1, 'Start date is required'),
    endsAt: z.string().min(1, 'End date is required'),
    registrationOpensAt: z.string().optional().or(z.literal('')),
    registrationClosesAt: z.string().optional().or(z.literal('')),
    submissionOpensAt: z.string().optional().or(z.literal('')),
    submissionClosesAt: z.string().optional().or(z.literal('')),
    prizePool: z.number().min(0).optional(),
    maxTeamSize: z.number().int().min(1, 'Max team size must be at least 1').max(20),
    minTeamSize: z.number().int().min(1, 'Min team size must be at least 1'),
    allowSoloTeams: z.boolean(),
    requireApproval: z.boolean(),
    isPublished: z.boolean(),
    tracks: z.array(trackSchema).optional(),
    criteria: z.array(criterionSchema).optional(),
  })
  .refine(data => new Date(data.endsAt) > new Date(data.startsAt), {
    message: 'End date must be after start date',
    path: ['endsAt'],
  })
  .refine(data => data.maxTeamSize >= data.minTeamSize, {
    message: 'Max team size must be greater than or equal to min team size',
    path: ['maxTeamSize'],
  });

export type CreateHackathonInput = z.infer<typeof createHackathonSchema>;

/**
 * Update hackathon validation schema (all fields optional except those that should never change)
 */
export const updateHackathonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200).optional(),
  subtitle: z.string().max(300).optional().or(z.literal('')),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(10000)
    .optional()
    .or(z.literal('')),
  status: z.nativeEnum(HackathonStatus).optional(),
  location: z.nativeEnum(HackathonLocation).optional(),
  virtualUrl: urlSchema,
  venue: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  timezone: z.string().max(50).optional().or(z.literal('')),
  bannerUrl: urlSchema,
  logoUrl: urlSchema,
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  registrationOpensAt: z.string().optional().or(z.literal('')),
  registrationClosesAt: z.string().optional().or(z.literal('')),
  submissionOpensAt: z.string().optional().or(z.literal('')),
  submissionClosesAt: z.string().optional().or(z.literal('')),
  prizePool: z.number().min(0).optional(),
  maxTeamSize: z.number().int().min(1, 'Max team size must be at least 1').max(20).optional(),
  minTeamSize: z.number().int().min(1, 'Min team size must be at least 1').optional(),
  allowSoloTeams: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export type UpdateHackathonInput = z.infer<typeof updateHackathonSchema>;

/**
 * Announce winners validation schema
 */
export const announceWinnersSchema = z.object({
  winners: z
    .array(
      z.object({
        submissionId: z.string(),
        rank: z.number().int().min(1),
        prize: z.string().optional(),
        prizeAmount: z.number().min(0).optional(),
      })
    )
    .min(1, 'At least one winner is required'),
});

export type AnnounceWinnersInput = z.infer<typeof announceWinnersSchema>;
