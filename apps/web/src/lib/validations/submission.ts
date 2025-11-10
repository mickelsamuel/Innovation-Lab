import { z } from 'zod';

/**
 * URL validation schema
 */
const urlSchema = z.string().url('Must be a valid URL').optional().or(z.literal(''));

/**
 * Create submission validation schema
 */
export const createSubmissionSchema = z.object({
  hackathonId: z.string().min(1, 'Hackathon ID is required'),
  teamId: z.string().min(1, 'Team ID is required'),
  trackId: z.string().optional(),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  abstract: z
    .string()
    .min(50, 'Abstract must be at least 50 characters')
    .max(5000, 'Abstract must be less than 5000 characters'),
  repoUrl: urlSchema,
  demoUrl: urlSchema,
  videoUrl: urlSchema,
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

/**
 * Update submission validation schema
 */
export const updateSubmissionSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  abstract: z
    .string()
    .min(50, 'Abstract must be at least 50 characters')
    .max(5000, 'Abstract must be less than 5000 characters')
    .optional(),
  repoUrl: urlSchema,
  demoUrl: urlSchema,
  videoUrl: urlSchema,
  trackId: z.string().optional(),
});

export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
