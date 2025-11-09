import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { prismaMock, resetPrismaMock } from '../../test/utils/prisma-mock';
import { ChallengeStatus, ChallengeSubmissionStatus, Role } from '@prisma/client';

describe('ChallengesService', () => {
  let service: ChallengesService;
  let gamificationService: GamificationService;

  beforeEach(async () => {
    resetPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: GamificationService,
          useValue: {
            awardXp: jest.fn().mockResolvedValue(undefined),
            awardBadge: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ChallengesService>(ChallengesService);
    gamificationService = module.get<GamificationService>(GamificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      slug: 'test-challenge',
      title: 'Test Challenge',
      problemStatement: 'Solve this problem',
      status: ChallengeStatus.OPEN,
      points: 100,
      categories: ['algorithm'],
      skills: ['javascript'],
    };

    it('should successfully create a challenge', async () => {
      const createdChallenge = {
        id: 'challenge-1',
        ...createDto,
        ownerId: 'user-1',
        attachments: [],
        owner: { id: 'user-1', name: 'User 1', handle: 'user1', avatarUrl: null },
        _count: { submissions: 0 },
      };

      prismaMock.challenge.findUnique.mockResolvedValue(null);
      prismaMock.challenge.create.mockResolvedValue(createdChallenge as any);

      const result = await service.create('user-1', createDto);

      expect(result).toEqual(createdChallenge);
      expect(prismaMock.challenge.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...createDto,
          ownerId: 'user-1',
          categories: ['algorithm'],
          skills: ['javascript'],
          attachments: [],
        }),
        include: expect.any(Object),
      });
    });

    it('should throw BadRequestException if slug already exists', async () => {
      const existingChallenge = { id: 'existing', slug: 'test-challenge' };

      prismaMock.challenge.findUnique.mockResolvedValue(existingChallenge as any);

      await expect(service.create('user-1', createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create('user-1', createDto)).rejects.toThrow('Challenge with this slug already exists');

      expect(prismaMock.challenge.create).not.toHaveBeenCalled();
    });

    it('should create challenge with empty categories and skills if not provided', async () => {
      const minimalDto = {
        slug: 'minimal',
        title: 'Minimal Challenge',
        problemStatement: 'Problem',
        status: ChallengeStatus.DRAFT,
        points: 50,
      };

      const createdChallenge = {
        id: 'challenge-2',
        ...minimalDto,
        ownerId: 'user-1',
        categories: [],
        skills: [],
        attachments: [],
        owner: { id: 'user-1', name: 'User 1', handle: 'user1', avatarUrl: null },
        _count: { submissions: 0 },
      };

      prismaMock.challenge.findUnique.mockResolvedValue(null);
      prismaMock.challenge.create.mockResolvedValue(createdChallenge as any);

      const result = await service.create('user-1', minimalDto);

      expect(result.categories).toEqual([]);
      expect(result.skills).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all challenges without filters', async () => {
      const challenges = [
        {
          id: 'c1',
          title: 'Challenge 1',
          owner: { id: 'u1', name: 'User 1', handle: 'user1', avatarUrl: null },
          _count: { submissions: 5 },
        },
        {
          id: 'c2',
          title: 'Challenge 2',
          owner: { id: 'u2', name: 'User 2', handle: 'user2', avatarUrl: null },
          _count: { submissions: 3 },
        },
      ];

      prismaMock.challenge.findMany.mockResolvedValue(challenges as any);

      const result = await service.findAll({});

      expect(result).toEqual(challenges);
      expect(prismaMock.challenge.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter challenges by status', async () => {
      prismaMock.challenge.findMany.mockResolvedValue([]);

      await service.findAll({ status: ChallengeStatus.OPEN });

      expect(prismaMock.challenge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ChallengeStatus.OPEN },
        })
      );
    });

    it('should filter challenges by category', async () => {
      prismaMock.challenge.findMany.mockResolvedValue([]);

      await service.findAll({ category: 'algorithm' });

      expect(prismaMock.challenge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            categories: {
              has: 'algorithm',
            },
          },
        })
      );
    });

    it('should filter challenges by skill', async () => {
      prismaMock.challenge.findMany.mockResolvedValue([]);

      await service.findAll({ skill: 'javascript' });

      expect(prismaMock.challenge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            skills: {
              has: 'javascript',
            },
          },
        })
      );
    });

    it('should filter challenges by owner', async () => {
      prismaMock.challenge.findMany.mockResolvedValue([]);

      await service.findAll({ ownerId: 'user-1' });

      expect(prismaMock.challenge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ownerId: 'user-1' },
        })
      );
    });

    it('should search challenges by title or problem statement', async () => {
      prismaMock.challenge.findMany.mockResolvedValue([]);

      await service.findAll({ search: 'algorithm' });

      expect(prismaMock.challenge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'algorithm', mode: 'insensitive' } },
              { problemStatement: { contains: 'algorithm', mode: 'insensitive' } },
            ],
          },
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a challenge by ID with all relations', async () => {
      const challenge = {
        id: 'challenge-1',
        title: 'Test Challenge',
        owner: { id: 'u1', name: 'User 1', handle: 'user1', avatarUrl: null },
        submissions: [],
        _count: { submissions: 0 },
      };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);

      const result = await service.findOne('challenge-1');

      expect(result).toEqual(challenge);
      expect(prismaMock.challenge.findUnique).toHaveBeenCalledWith({
        where: { id: 'challenge-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if challenge not found', async () => {
      prismaMock.challenge.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a challenge by slug', async () => {
      const challenge = {
        id: 'challenge-1',
        slug: 'test-challenge',
        title: 'Test Challenge',
        owner: { id: 'u1', name: 'User 1', handle: 'user1', avatarUrl: null },
        _count: { submissions: 0 },
      };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);

      const result = await service.findBySlug('test-challenge');

      expect(result).toEqual(challenge);
      expect(prismaMock.challenge.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-challenge' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if challenge not found', async () => {
      prismaMock.challenge.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Challenge',
      problemStatement: 'Updated problem',
      points: 150,
    };

    it('should successfully update challenge when user is owner', async () => {
      const challenge = { id: 'challenge-1', ownerId: 'user-1', slug: 'test' };
      const updatedChallenge = {
        ...challenge,
        ...updateDto,
        owner: { id: 'user-1', name: 'User 1', handle: 'user1', avatarUrl: null },
        _count: { submissions: 0 },
      };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);
      prismaMock.challenge.update.mockResolvedValue(updatedChallenge as any);

      const result = await service.update('challenge-1', 'user-1', Role.PARTICIPANT, updateDto);

      expect(result).toEqual(updatedChallenge);
      expect(prismaMock.challenge.update).toHaveBeenCalledWith({
        where: { id: 'challenge-1' },
        data: updateDto,
        include: expect.any(Object),
      });
    });

    it('should successfully update challenge when user is BANK_ADMIN', async () => {
      const challenge = { id: 'challenge-1', ownerId: 'user-2', slug: 'test' };
      const updatedChallenge = {
        ...challenge,
        ...updateDto,
        owner: { id: 'user-2', name: 'User 2', handle: 'user2', avatarUrl: null },
        _count: { submissions: 0 },
      };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);
      prismaMock.challenge.update.mockResolvedValue(updatedChallenge as any);

      const result = await service.update('challenge-1', 'admin-1', Role.BANK_ADMIN, updateDto);

      expect(result).toEqual(updatedChallenge);
    });

    it('should throw NotFoundException if challenge not found', async () => {
      prismaMock.challenge.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', 'user-1', Role.PARTICIPANT, updateDto)).rejects.toThrow(NotFoundException);

      expect(prismaMock.challenge.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not owner or admin', async () => {
      const challenge = { id: 'challenge-1', ownerId: 'user-2', slug: 'test' };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);

      await expect(service.update('challenge-1', 'user-1', Role.PARTICIPANT, updateDto)).rejects.toThrow(ForbiddenException);
      await expect(service.update('challenge-1', 'user-1', Role.PARTICIPANT, updateDto)).rejects.toThrow('You can only update your own challenges');

      expect(prismaMock.challenge.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if new slug already exists', async () => {
      const challenge = { id: 'challenge-1', ownerId: 'user-1', slug: 'old-slug' };
      const existingChallenge = { id: 'challenge-2', slug: 'new-slug' };

      prismaMock.challenge.findUnique
        .mockResolvedValueOnce(challenge as any)
        .mockResolvedValueOnce(existingChallenge as any);

      await expect(service.update('challenge-1', 'user-1', Role.PARTICIPANT, { slug: 'new-slug' })).rejects.toThrow(BadRequestException);

      expect(prismaMock.challenge.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same slug', async () => {
      const challenge = { id: 'challenge-1', ownerId: 'user-1', slug: 'same-slug' };
      const updatedChallenge = {
        ...challenge,
        title: 'Updated',
        owner: { id: 'user-1', name: 'User 1', handle: 'user1', avatarUrl: null },
        _count: { submissions: 0 },
      };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);
      prismaMock.challenge.update.mockResolvedValue(updatedChallenge as any);

      const result = await service.update('challenge-1', 'user-1', Role.PARTICIPANT, { slug: 'same-slug', title: 'Updated' });

      expect(result).toEqual(updatedChallenge);
    });
  });

  describe('remove', () => {
    it('should successfully delete challenge when user is owner', async () => {
      const challenge = { id: 'challenge-1', ownerId: 'user-1' };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);
      prismaMock.challenge.delete.mockResolvedValue({} as any);

      await service.remove('challenge-1', 'user-1', Role.PARTICIPANT);

      expect(prismaMock.challenge.delete).toHaveBeenCalledWith({
        where: { id: 'challenge-1' },
      });
    });

    it('should successfully delete challenge when user is BANK_ADMIN', async () => {
      const challenge = { id: 'challenge-1', ownerId: 'user-2' };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);
      prismaMock.challenge.delete.mockResolvedValue({} as any);

      await service.remove('challenge-1', 'admin-1', Role.BANK_ADMIN);

      expect(prismaMock.challenge.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if challenge not found', async () => {
      prismaMock.challenge.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'user-1', Role.PARTICIPANT)).rejects.toThrow(NotFoundException);

      expect(prismaMock.challenge.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not owner or admin', async () => {
      const challenge = { id: 'challenge-1', ownerId: 'user-2' };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);

      await expect(service.remove('challenge-1', 'user-1', Role.PARTICIPANT)).rejects.toThrow(ForbiddenException);
      await expect(service.remove('challenge-1', 'user-1', Role.PARTICIPANT)).rejects.toThrow('You can only delete your own challenges');

      expect(prismaMock.challenge.delete).not.toHaveBeenCalled();
    });
  });

  describe('submitSolution', () => {
    const submitDto = {
      title: 'My Solution',
      content: 'My solution code with detailed explanation that is at least fifty characters long to meet requirements',
      repoUrl: 'https://github.com/user/solution',
      teamId: undefined,
    };

    it('should successfully submit a solution', async () => {
      const challenge = {
        id: 'challenge-1',
        status: ChallengeStatus.OPEN,
        deadlineAt: new Date('2025-12-31'),
      };

      const submission = {
        id: 'submission-1',
        challengeId: 'challenge-1',
        userId: 'user-1',
        ...submitDto,
        status: ChallengeSubmissionStatus.SUBMITTED,
      };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);
      prismaMock.challengeSubmission.findFirst.mockResolvedValue(null);
      prismaMock.challengeSubmission.create.mockResolvedValue(submission as any);

      const result = await service.submitSolution('challenge-1', 'user-1', submitDto);

      expect(result).toEqual(submission);
      expect(prismaMock.challengeSubmission.create).toHaveBeenCalled();

      // Verify XP awarded
      expect(gamificationService.awardXp).toHaveBeenCalled();
    });

    it('should throw NotFoundException if challenge not found', async () => {
      prismaMock.challenge.findUnique.mockResolvedValue(null);

      await expect(service.submitSolution('non-existent', 'user-1', submitDto)).rejects.toThrow(NotFoundException);

      expect(prismaMock.challengeSubmission.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if challenge is not open', async () => {
      const challenge = {
        id: 'challenge-1',
        status: ChallengeStatus.CLOSED,
        deadlineAt: new Date('2025-12-31'),
      };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);

      await expect(service.submitSolution('challenge-1', 'user-1', submitDto)).rejects.toThrow(BadRequestException);
      await expect(service.submitSolution('challenge-1', 'user-1', submitDto)).rejects.toThrow('Challenge is not open for submissions');

      expect(prismaMock.challengeSubmission.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if deadline has passed', async () => {
      const challenge = {
        id: 'challenge-1',
        status: ChallengeStatus.OPEN,
        deadlineAt: new Date('2020-01-01'),
      };

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);

      await expect(service.submitSolution('challenge-1', 'user-1', submitDto)).rejects.toThrow(BadRequestException);
      await expect(service.submitSolution('challenge-1', 'user-1', submitDto)).rejects.toThrow('Submission deadline has passed');

      expect(prismaMock.challengeSubmission.create).not.toHaveBeenCalled();
    });
  });

  describe('getChallengeSubmissions', () => {
    it('should return all submissions for a challenge', async () => {
      const challenge = { id: 'challenge-1', title: 'Test Challenge' };
      const submissions = [
        {
          id: 's1',
          user: { id: 'u1', name: 'User 1', handle: 'user1', avatarUrl: null },
          status: ChallengeSubmissionStatus.ACCEPTED,
        },
        {
          id: 's2',
          user: { id: 'u2', name: 'User 2', handle: 'user2', avatarUrl: null },
          status: ChallengeSubmissionStatus.SUBMITTED,
        },
      ];

      prismaMock.challenge.findUnique.mockResolvedValue(challenge as any);
      prismaMock.challengeSubmission.findMany.mockResolvedValue(submissions as any);

      const result = await service.getChallengeSubmissions('challenge-1');

      expect(result).toEqual(submissions);
      expect(prismaMock.challengeSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { challengeId: 'challenge-1' },
        })
      );
    });
  });

  describe('getUserSubmissions', () => {
    it('should return all submissions by a user', async () => {
      const submissions = [
        {
          id: 's1',
          challenge: { id: 'c1', title: 'Challenge 1' },
          status: ChallengeSubmissionStatus.ACCEPTED,
        },
        {
          id: 's2',
          challenge: { id: 'c2', title: 'Challenge 2' },
          status: ChallengeSubmissionStatus.SUBMITTED,
        },
      ];

      prismaMock.challengeSubmission.findMany.mockResolvedValue(submissions as any);

      const result = await service.getUserSubmissions('user-1');

      expect(result).toEqual(submissions);
      expect(prismaMock.challengeSubmission.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getCompletedCount', () => {
    it('should return count of approved submissions', async () => {
      prismaMock.challengeSubmission.count.mockResolvedValue(5);

      const result = await service.getCompletedCount('user-1');

      expect(result).toEqual({ count: 5 });
      expect(prismaMock.challengeSubmission.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: {
            in: [ChallengeSubmissionStatus.ACCEPTED, ChallengeSubmissionStatus.WINNER],
          },
        },
      });
    });
  });
});
