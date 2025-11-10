import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ChallengeStatus, ChallengeSubmissionStatus, Role } from '@prisma/client';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { SubmitSolutionDto } from './dto/submit-solution.dto';
import { ReviewSolutionDto } from './dto/review-solution.dto';
import { GamificationService, XP_POINTS } from '../gamification/gamification.service';

export interface ChallengeFilters {
  status?: ChallengeStatus;
  category?: string;
  skill?: string;
  ownerId?: string;
  search?: string;
}

@Injectable()
export class ChallengesService {
  private readonly logger = new Logger(ChallengesService.name);

  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService
  ) {}

  /**
   * Create a new challenge
   */
  async create(
    ownerId: string,
    createChallengeDto: CreateChallengeDto
  ): Promise<Record<string, unknown>> {
    // Check if slug already exists
    const existingChallenge = await this.prisma.challenge.findUnique({
      where: { slug: createChallengeDto.slug },
    });

    if (existingChallenge) {
      throw new BadRequestException('Challenge with this slug already exists');
    }

    const challenge = await this.prisma.challenge.create({
      data: {
        ...createChallengeDto,
        ownerId,
        categories: createChallengeDto.categories || [],
        skills: createChallengeDto.skills || [],
        attachments: [],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    this.logger.log(`Challenge created: ${challenge.id} by user ${ownerId}`);

    return challenge;
  }

  /**
   * Get all challenges with filters
   */
  async findAll(filters: ChallengeFilters = {}): Promise<unknown[]> {
    const { status, category, skill, ownerId, search } = filters;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.categories = {
        has: category,
      };
    }

    if (skill) {
      where.skills = {
        has: skill,
      };
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { problemStatement: { contains: search, mode: 'insensitive' } },
      ];
    }

    const challenges = await this.prisma.challenge.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return challenges;
  }

  /**
   * Get challenge by ID
   */
  async findOne(id: string): Promise<Record<string, unknown>> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                handle: true,
                avatarUrl: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return challenge;
  }

  /**
   * Get challenge by slug
   */
  async findBySlug(slug: string): Promise<Record<string, unknown>> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return challenge;
  }

  /**
   * Update challenge
   */
  async update(
    id: string,
    userId: string,
    userRole: Role,
    updateChallengeDto: UpdateChallengeDto
  ): Promise<Record<string, unknown>> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Check permissions
    const isOwner = challenge.ownerId === userId;
    const isAdmin = userRole === Role.BANK_ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only update your own challenges');
    }

    // If updating slug, check it doesn't exist
    if (updateChallengeDto.slug && updateChallengeDto.slug !== challenge.slug) {
      const existingChallenge = await this.prisma.challenge.findUnique({
        where: { slug: updateChallengeDto.slug },
      });

      if (existingChallenge) {
        throw new BadRequestException('Challenge with this slug already exists');
      }
    }

    const updated = await this.prisma.challenge.update({
      where: { id },
      data: updateChallengeDto,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    this.logger.log(`Challenge updated: ${id} by user ${userId}`);

    return updated;
  }

  /**
   * Delete challenge
   */
  async remove(id: string, userId: string, userRole: Role): Promise<void> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Check permissions
    const isOwner = challenge.ownerId === userId;
    const isAdmin = userRole === Role.BANK_ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own challenges');
    }

    await this.prisma.challenge.delete({
      where: { id },
    });

    this.logger.log(`Challenge deleted: ${id} by user ${userId}`);
  }

  /**
   * Submit a solution to a challenge
   */
  async submitSolution(
    challengeId: string,
    userId: string,
    submitSolutionDto: SubmitSolutionDto
  ): Promise<Record<string, unknown>> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Check if challenge is open for submissions
    if (challenge.status !== ChallengeStatus.OPEN) {
      throw new BadRequestException('Challenge is not open for submissions');
    }

    // Check if deadline has passed
    if (challenge.deadlineAt && new Date() > new Date(challenge.deadlineAt)) {
      throw new BadRequestException('Submission deadline has passed');
    }

    // Check for duplicate submission
    const existingSubmission = await this.prisma.challengeSubmission.findFirst({
      where: {
        challengeId,
        userId,
        teamId: submitSolutionDto.teamId || null,
      },
    });

    if (existingSubmission) {
      throw new BadRequestException('You have already submitted a solution to this challenge');
    }

    const submission = await this.prisma.challengeSubmission.create({
      data: {
        challengeId,
        userId,
        teamId: submitSolutionDto.teamId,
        title: submitSolutionDto.title,
        content: submitSolutionDto.content,
        repoUrl: submitSolutionDto.repoUrl,
        files: [],
        status: ChallengeSubmissionStatus.SUBMITTED,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        challenge: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // Award XP for submitting challenge solution
    await this.gamificationService.awardXp(
      userId,
      'SUBMIT_CHALLENGE_SOLUTION',
      XP_POINTS.SUBMIT_CHALLENGE_SOLUTION,
      'challenge',
      challengeId
    );

    this.logger.log(
      `Solution submitted: ${submission.id} for challenge ${challengeId} by user ${userId}`
    );

    return submission;
  }

  /**
   * Get all submissions for a challenge
   */
  async getChallengeSubmissions(challengeId: string): Promise<unknown[]> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const submissions = await this.prisma.challengeSubmission.findMany({
      where: { challengeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
    });

    return submissions;
  }

  /**
   * Get submission by ID
   */
  async getSubmissionById(submissionId: string): Promise<Record<string, unknown>> {
    const submission = await this.prisma.challengeSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        challenge: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  /**
   * Get user's submissions
   */
  async getUserSubmissions(userId: string): Promise<unknown[]> {
    const submissions = await this.prisma.challengeSubmission.findMany({
      where: { userId },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return submissions;
  }

  /**
   * Get count of completed challenges for user
   */
  async getCompletedCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.challengeSubmission.count({
      where: {
        userId,
        status: {
          in: [ChallengeSubmissionStatus.ACCEPTED, ChallengeSubmissionStatus.WINNER],
        },
      },
    });

    return { count };
  }

  /**
   * Review a submission
   */
  async reviewSubmission(
    submissionId: string,
    userId: string,
    userRole: Role,
    reviewSolutionDto: ReviewSolutionDto
  ): Promise<Record<string, unknown>> {
    const submission = await this.prisma.challengeSubmission.findUnique({
      where: { id: submissionId },
      include: {
        challenge: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Check permissions - must be challenge owner or admin
    const isOwner = submission.challenge.ownerId === userId;
    const isAdmin = userRole === Role.BANK_ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only challenge owner or admin can review submissions');
    }

    const updated = await this.prisma.challengeSubmission.update({
      where: { id: submissionId },
      data: {
        status: reviewSolutionDto.status,
        score: reviewSolutionDto.score,
        feedback: reviewSolutionDto.feedback,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        challenge: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // Award XP based on review status
    if (updated.userId) {
      if (reviewSolutionDto.status === ChallengeSubmissionStatus.ACCEPTED) {
        await this.gamificationService.awardXp(
          updated.userId,
          'CHALLENGE_ACCEPTED',
          XP_POINTS.CHALLENGE_ACCEPTED,
          'challenge_submission',
          submissionId
        );
      } else if (reviewSolutionDto.status === ChallengeSubmissionStatus.WINNER) {
        await this.gamificationService.awardXp(
          updated.userId,
          'CHALLENGE_WINNER',
          XP_POINTS.CHALLENGE_WINNER,
          'challenge_submission',
          submissionId
        );
      }
    }

    this.logger.log(
      `Submission reviewed: ${submissionId} by user ${userId} - status: ${reviewSolutionDto.status}`
    );

    return updated;
  }
}
