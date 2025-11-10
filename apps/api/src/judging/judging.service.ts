import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AssignJudgeDto } from './dto/assign-judge.dto';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { Role } from '@innovation-lab/database';
import { GamificationService, XP_POINTS } from '../gamification/gamification.service';
import { WebSocketService } from '../websocket/websocket.service';

@Injectable()
export class JudgingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
    private readonly webSocketService: WebSocketService
  ) {}

  /**
   * Assign a judge to a hackathon
   */
  async assignJudge(hackathonId: string, dto: AssignJudgeDto, assignerId: string) {
    // Verify hackathon exists
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Verify user exists and has JUDGE or BANK_ADMIN role
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.roles.includes(Role.JUDGE) && !user.roles.includes(Role.BANK_ADMIN)) {
      throw new BadRequestException('User must have JUDGE or BANK_ADMIN role');
    }

    // Check if already assigned
    const existing = await this.prisma.judge.findUnique({
      where: {
        userId_hackathonId: {
          hackathonId,
          userId: dto.userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Judge already assigned to this hackathon');
    }

    // Assign judge
    const judge = await this.prisma.judge.create({
      data: {
        hackathonId,
        userId: dto.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: assignerId,
        action: 'JUDGE_ASSIGN',
        entityType: 'JUDGE',
        entityId: judge.id,
        metadata: {
          hackathonId,
          judgeUserId: dto.userId,
        },
      },
    });

    return judge;
  }

  /**
   * Get all judges for a hackathon
   */
  async getJudges(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return this.prisma.judge.findMany({
      where: { hackathonId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            scores: true,
          },
        },
      },
    });
  }

  /**
   * Remove a judge from a hackathon
   */
  async removeJudge(hackathonId: string, userId: string, removerId: string) {
    const judge = await this.prisma.judge.findUnique({
      where: {
        userId_hackathonId: {
          hackathonId,
          userId,
        },
      },
    });

    if (!judge) {
      throw new NotFoundException('Judge assignment not found');
    }

    // Check if judge has already scored submissions
    const scoresCount = await this.prisma.score.count({
      where: {
        judgeId: judge.id,
      },
    });

    if (scoresCount > 0) {
      throw new BadRequestException('Cannot remove judge who has already scored submissions');
    }

    await this.prisma.judge.delete({
      where: { id: judge.id },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: removerId,
        action: 'JUDGE_REMOVE',
        entityType: 'JUDGE',
        entityId: judge.id,
        metadata: {
          hackathonId,
          judgeUserId: userId,
        },
      },
    });

    return { success: true, message: 'Judge removed successfully' };
  }

  /**
   * Create a score for a submission
   */
  async createScore(submissionId: string, dto: CreateScoreDto, judgeUserId: string) {
    // Get submission with hackathon and team info
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        hackathon: {
          include: {
            criteria: true,
          },
        },
        team: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Verify submission is finalized
    if (submission.status !== 'FINAL') {
      throw new BadRequestException('Can only score finalized submissions');
    }

    // Verify criterion exists and belongs to this hackathon
    const criterion = submission.hackathon.criteria.find(c => c.id === dto.criterionId);
    if (!criterion) {
      throw new NotFoundException('Criterion not found for this hackathon');
    }

    // Verify score is within criterion max
    if (dto.value > criterion.maxScore) {
      throw new BadRequestException(
        `Score cannot exceed maximum of ${criterion.maxScore} for this criterion`
      );
    }

    // Get judge record
    const judge = await this.prisma.judge.findUnique({
      where: {
        userId_hackathonId: {
          hackathonId: submission.hackathonId,
          userId: judgeUserId,
        },
      },
    });

    if (!judge) {
      throw new ForbiddenException('You are not assigned as a judge for this hackathon');
    }

    // Check for conflict of interest (judge is team member)
    const isTeamMember = submission.team.members.some(m => m.userId === judgeUserId);
    if (isTeamMember) {
      throw new ForbiddenException("Cannot score your own team's submission");
    }

    // Check if judge already scored this criterion for this submission
    const existingScore = await this.prisma.score.findUnique({
      where: {
        submissionId_judgeId_criterionId: {
          submissionId,
          judgeId: judge.id,
          criterionId: dto.criterionId,
        },
      },
    });

    if (existingScore) {
      throw new ConflictException('You have already scored this criterion for this submission');
    }

    // Create score
    const score = await this.prisma.score.create({
      data: {
        submissionId,
        judgeId: judge.id,
        criterionId: dto.criterionId,
        score: dto.value,
        feedback: dto.feedback,
      },
      include: {
        criterion: true,
        judge: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                handle: true,
              },
            },
          },
        },
      },
    });

    // Recalculate submission aggregate score
    await this.updateSubmissionScore(submissionId);

    // Award XP to all team members for receiving judge score
    for (const member of submission.team.members) {
      await this.gamificationService.awardXp(
        member.userId,
        'RECEIVE_JUDGE_SCORE',
        XP_POINTS.RECEIVE_JUDGE_SCORE,
        'score',
        score.id
      );
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: judgeUserId,
        action: 'SCORE_CREATE',
        entityType: 'SCORE',
        entityId: score.id,
        metadata: {
          submissionId,
          criterionId: dto.criterionId,
          score: dto.value,
        },
      },
    });

    // Emit real-time event for new score
    const updatedSubmission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        team: true,
        scores: true,
      },
    });

    if (updatedSubmission) {
      this.webSocketService.emitSubmissionScored(
        submission.hackathonId,
        submission.teamId,
        updatedSubmission
      );
    }

    return score;
  }

  /**
   * Get all scores for a submission
   */
  async getScores(submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return this.prisma.score.findMany({
      where: { submissionId },
      include: {
        criterion: true,
        judge: {
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
        },
      },
      orderBy: [{ criterion: { order: 'asc' } }, { createdAt: 'desc' }],
    });
  }

  /**
   * Update a score
   */
  async updateScore(scoreId: string, dto: UpdateScoreDto, judgeUserId: string) {
    const score = await this.prisma.score.findUnique({
      where: { id: scoreId },
      include: {
        judge: {
          include: {
            user: true,
          },
        },
        criterion: true,
        submission: true,
      },
    });

    if (!score) {
      throw new NotFoundException('Score not found');
    }

    // Verify judge owns this score
    if (score.judge.userId !== judgeUserId) {
      throw new ForbiddenException('You can only update your own scores');
    }

    // Verify score is within criterion max if updating value
    if (dto.value !== undefined && dto.value > score.criterion.maxScore) {
      throw new BadRequestException(
        `Score cannot exceed maximum of ${score.criterion.maxScore} for this criterion`
      );
    }

    const updated = await this.prisma.score.update({
      where: { id: scoreId },
      data: {
        score: dto.value,
        feedback: dto.feedback,
      },
      include: {
        criterion: true,
        judge: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                handle: true,
              },
            },
          },
        },
      },
    });

    // Recalculate submission aggregate score
    await this.updateSubmissionScore(score.submissionId);

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: judgeUserId,
        action: 'SCORE_UPDATE',
        entityType: 'SCORE',
        entityId: scoreId,
      },
    });

    return updated;
  }

  /**
   * Delete a score
   */
  async deleteScore(scoreId: string, judgeUserId: string) {
    const score = await this.prisma.score.findUnique({
      where: { id: scoreId },
      include: {
        judge: true,
      },
    });

    if (!score) {
      throw new NotFoundException('Score not found');
    }

    // Verify judge owns this score
    if (score.judge.userId !== judgeUserId) {
      throw new ForbiddenException('You can only delete your own scores');
    }

    const submissionId = score.submissionId;

    await this.prisma.score.delete({
      where: { id: scoreId },
    });

    // Recalculate submission aggregate score
    await this.updateSubmissionScore(submissionId);

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: judgeUserId,
        action: 'SCORE_DELETE',
        entityType: 'SCORE',
        entityId: scoreId,
      },
    });

    return { success: true, message: 'Score deleted successfully' };
  }

  /**
   * Get submissions assigned to a judge
   */
  async getJudgeAssignments(judgeUserId: string, hackathonId?: string) {
    const where: any = {
      userId: judgeUserId,
    };

    if (hackathonId) {
      where.hackathonId = hackathonId;
    }

    const judges = await this.prisma.judge.findMany({
      where,
      include: {
        hackathon: {
          include: {
            submissions: {
              where: {
                status: 'FINAL',
              },
              include: {
                team: {
                  include: {
                    members: {
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
                    },
                  },
                },
                track: true,
                _count: {
                  select: {
                    scores: true,
                  },
                },
              },
            },
            criteria: true,
          },
        },
      },
    });

    return judges;
  }

  /**
   * Calculate and update submission aggregate score
   */
  private async updateSubmissionScore(submissionId: string) {
    // Get all scores for this submission
    const scores = await this.prisma.score.findMany({
      where: { submissionId },
      include: {
        criterion: true,
      },
    });

    if (scores.length === 0) {
      // No scores yet, set aggregate to null
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          scoreAggregate: null,
        },
      });
      return;
    }

    // Group scores by criterion
    const scoreByCriterion = scores.reduce(
      (acc, score) => {
        if (!acc[score.criterionId]) {
          acc[score.criterionId] = [];
        }
        acc[score.criterionId].push(score);
        return acc;
      },
      {} as Record<string, typeof scores>
    );

    // Calculate weighted average
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const criterionId in scoreByCriterion) {
      const criterionScores = scoreByCriterion[criterionId];
      const criterion = criterionScores[0].criterion;

      // Average scores from all judges for this criterion
      const avgScore =
        criterionScores.reduce((sum, s) => sum + Number(s.score), 0) / criterionScores.length;

      // Normalize to 0-100 scale
      const normalizedScore = (avgScore / criterion.maxScore) * 100;

      // Apply weight
      totalWeightedScore += normalizedScore * Number(criterion.weight);
      totalWeight += Number(criterion.weight);
    }

    // Final aggregate score (0-100)
    const aggregateScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        scoreAggregate: aggregateScore,
      },
    });
  }

  /**
   * Calculate rankings for a hackathon
   */
  async calculateRankings(hackathonId: string, actorId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Get all final submissions with scores
    const submissions = await this.prisma.submission.findMany({
      where: {
        hackathonId,
        status: 'FINAL',
        scoreAggregate: {
          not: null,
        },
      },
      orderBy: {
        scoreAggregate: 'desc',
      },
    });

    // Assign ranks
    const rankedSubmissions = [];
    for (let i = 0; i < submissions.length; i++) {
      const updated = await this.prisma.submission.update({
        where: { id: submissions[i].id },
        data: {
          rank: i + 1,
        },
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      });
      rankedSubmissions.push(updated);
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'RANKINGS_CALCULATE',
        entityType: 'HACKATHON',
        entityId: hackathonId,
        metadata: {
          submissionsRanked: submissions.length,
        },
      },
    });

    // Emit real-time leaderboard update
    this.webSocketService.emitLeaderboardUpdate(hackathonId, rankedSubmissions);

    return {
      success: true,
      message: 'Rankings calculated successfully',
      submissionsRanked: submissions.length,
    };
  }
}
