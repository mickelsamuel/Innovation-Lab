import { describe, it, expect } from 'vitest';
import { createSubmissionSchema, updateSubmissionSchema } from './submission';

describe('Submission Validations', () => {
  describe('createSubmissionSchema', () => {
    const validData = {
      hackathonId: 'hackathon-123',
      teamId: 'team-456',
      title: 'My Awesome Project',
      abstract: 'a'.repeat(50), // Min 50 characters
      repoUrl: 'https://github.com/user/repo',
      demoUrl: 'https://demo.example.com',
      videoUrl: 'https://youtube.com/watch?v=123',
    };

    it('should validate correct submission data', () => {
      const result = createSubmissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require hackathonId', () => {
      const result = createSubmissionSchema.safeParse({
        ...validData,
        hackathonId: '',
      });
      expect(result.success).toBe(false);
    });

    it('should require teamId', () => {
      const result = createSubmissionSchema.safeParse({
        ...validData,
        teamId: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short title', () => {
      const result = createSubmissionSchema.safeParse({
        ...validData,
        title: 'Shor',
      });
      expect(result.success).toBe(false);
    });

    it('should reject long title', () => {
      const result = createSubmissionSchema.safeParse({
        ...validData,
        title: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it('should reject short abstract', () => {
      const result = createSubmissionSchema.safeParse({
        ...validData,
        abstract: 'Too short',
      });
      expect(result.success).toBe(false);
    });

    it('should reject long abstract', () => {
      const result = createSubmissionSchema.safeParse({
        ...validData,
        abstract: 'a'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional trackId', () => {
      const result = createSubmissionSchema.safeParse({
        ...validData,
        trackId: 'track-789',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty URL strings', () => {
      const result = createSubmissionSchema.safeParse({
        ...validData,
        repoUrl: '',
        demoUrl: '',
        videoUrl: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid repo URL', () => {
      const result = createSubmissionSchema.safeParse({
        ...validData,
        repoUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid demo URL', () => {
      const result = createSubmissionSchema.safeParse({
        ...validData,
        demoUrl: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid video URL', () => {
      const result = createSubmissionSchema.safeParse({
        ...validData,
        videoUrl: 'bad-url',
      });
      expect(result.success).toBe(false);
    });

    it('should accept missing optional URLs', () => {
      const result = createSubmissionSchema.safeParse({
        hackathonId: 'hackathon-123',
        teamId: 'team-456',
        title: 'My Project',
        abstract: 'a'.repeat(50),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateSubmissionSchema', () => {
    it('should validate with all optional fields', () => {
      const result = updateSubmissionSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate title update', () => {
      const result = updateSubmissionSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short title', () => {
      const result = updateSubmissionSchema.safeParse({
        title: 'Shor',
      });
      expect(result.success).toBe(false);
    });

    it('should validate abstract update', () => {
      const result = updateSubmissionSchema.safeParse({
        abstract: 'a'.repeat(50),
      });
      expect(result.success).toBe(true);
    });

    it('should reject short abstract', () => {
      const result = updateSubmissionSchema.safeParse({
        abstract: 'Too short',
      });
      expect(result.success).toBe(false);
    });

    it('should validate URL updates', () => {
      const result = updateSubmissionSchema.safeParse({
        repoUrl: 'https://github.com/user/repo',
        demoUrl: 'https://demo.example.com',
        videoUrl: 'https://youtube.com/watch?v=xyz',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty URLs', () => {
      const result = updateSubmissionSchema.safeParse({
        repoUrl: '',
        demoUrl: '',
        videoUrl: '',
      });
      expect(result.success).toBe(true);
    });

    it('should validate trackId update', () => {
      const result = updateSubmissionSchema.safeParse({
        trackId: 'new-track-id',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const result = updateSubmissionSchema.safeParse({
        repoUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });
  });
});
