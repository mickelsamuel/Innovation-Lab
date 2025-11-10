import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionStatus, TeamMemberRole } from '@innovation-lab/database';
import { GamificationService, XP_POINTS } from '../gamification/gamification.service';
import { WebSocketService } from '../websocket/websocket.service';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
    private readonly webSocketService: WebSocketService
  ) {}

  /**
   * Create new submission
   */
  async create(dto: CreateSubmissionDto, userId: string) {
    // Check if team exists and user is a member
    const team = await this.prisma.team.findUnique({
      where: { id: dto.teamId },
      include: {
        members: true,
        hackathon: {
          select: {
            id: true,
            status: true,
            endsAt: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user is a team member
    const isMember = team.members.some(m => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Check if hackathon accepts submissions
    if (team.hackathon.status === 'CLOSED' || team.hackathon.status === 'DRAFT') {
      throw new BadRequestException('Hackathon is not accepting submissions');
    }

    // Check if submission deadline has passed
    if (new Date() > new Date(team.hackathon.endsAt)) {
      throw new BadRequestException('Submission deadline has passed');
    }

    // Check if team already has a submission for this hackathon
    const existing = await this.prisma.submission.findFirst({
      where: {
        hackathonId: dto.hackathonId,
        teamId: dto.teamId,
      },
    });

    if (existing) {
      throw new BadRequestException('Team already has a submission for this hackathon');
    }

    // Create submission
    const submission = await this.prisma.submission.create({
      data: {
        hackathonId: dto.hackathonId,
        teamId: dto.teamId,
        trackId: dto.trackId,
        title: dto.title,
        abstract: dto.abstract,
        repoUrl: dto.repoUrl,
        demoUrl: dto.demoUrl,
        videoUrl: dto.videoUrl,
        files: dto.files || [],
        status: SubmissionStatus.DRAFT,
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
      },
    });

    // Award XP to all team members for submitting project
    for (const member of submission.team.members) {
      await this.gamificationService.awardXp(
        member.userId,
        'SUBMIT_PROJECT',
        XP_POINTS.SUBMIT_PROJECT,
        'submission',
        submission.id
      );
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'SUBMISSION_CREATE',
        entityType: 'SUBMISSION',
        entityId: submission.id,
      },
    });

    // Emit real-time event for new submission
    this.webSocketService.emitNewSubmission(dto.hackathonId, submission);

    return submission;
  }

  /**
   * Find all submissions for a hackathon
   */
  async findAll(hackathonId: string, status?: SubmissionStatus) {
    const where: any = { hackathonId };
    if (status) {
      where.status = status;
    }

    const submissions = await this.prisma.submission.findMany({
      where,
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
      orderBy: [{ rank: 'asc' }, { scoreAggregate: 'desc' }, { submittedAt: 'desc' }],
    });

    return submissions;
  }

  /**
   * Find one submission by ID
   */
  async findOne(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
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
                    bio: true,
                  },
                },
              },
            },
          },
        },
        track: true,
        hackathon: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
        scores: {
          include: {
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
            criterion: true,
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
   * Find all submissions where user is a team member
   */
  async findUserSubmissions(userId: string) {
    // Get all teams where user is a member
    const teamMembers = await this.prisma.teamMember.findMany({
      where: { userId },
      select: { teamId: true },
    });

    const teamIds = teamMembers.map(tm => tm.teamId);

    if (teamIds.length === 0) {
      return [];
    }

    // Get all submissions for those teams
    const submissions = await this.prisma.submission.findMany({
      where: {
        teamId: { in: teamIds },
      },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
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
   * Update submission
   */
  async update(id: string, dto: UpdateSubmissionDto, userId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            members: true,
          },
        },
        hackathon: {
          select: {
            endsAt: true,
            status: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Check if user is a team member
    const isMember = submission.team.members.some(m => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Only team members can update submission');
    }

    // Cannot update if finalized
    if (submission.status === SubmissionStatus.FINAL) {
      throw new BadRequestException('Cannot update finalized submission');
    }

    // Check if hackathon is still open
    if (new Date() > new Date(submission.hackathon.endsAt)) {
      throw new BadRequestException('Cannot update submission after deadline');
    }

    const updated = await this.prisma.submission.update({
      where: { id },
      data: {
        title: dto.title,
        abstract: dto.abstract,
        repoUrl: dto.repoUrl,
        demoUrl: dto.demoUrl,
        videoUrl: dto.videoUrl,
        files: dto.files,
        trackId: dto.trackId,
      },
      include: {
        team: true,
        track: true,
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'SUBMISSION_UPDATE',
        entityType: 'SUBMISSION',
        entityId: id,
      },
    });

    return updated;
  }

  /**
   * Submit (finalize) submission
   */
  async submit(id: string, userId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            members: true,
          },
        },
        hackathon: {
          select: {
            id: true,
            endsAt: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Check if user is team lead
    const member = submission.team.members.find(m => m.userId === userId);
    if (!member || member.role !== TeamMemberRole.LEAD) {
      throw new ForbiddenException('Only team lead can finalize submission');
    }

    // Check if already finalized
    if (submission.status === SubmissionStatus.FINAL) {
      throw new BadRequestException('Submission already finalized');
    }

    // Check deadline
    if (new Date() > new Date(submission.hackathon.endsAt)) {
      throw new BadRequestException('Submission deadline has passed');
    }

    // Finalize submission
    const finalized = await this.prisma.submission.update({
      where: { id },
      data: {
        status: SubmissionStatus.FINAL,
        submittedAt: new Date(),
        finalizedAt: new Date(),
      },
    });

    // Award XP to all team members for finalizing submission
    for (const member of submission.team.members) {
      await this.gamificationService.awardXp(
        member.userId,
        'FINALIZE_SUBMISSION',
        XP_POINTS.FINALIZE_SUBMISSION,
        'submission',
        id
      );
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'SUBMISSION_FINALIZE',
        entityType: 'SUBMISSION',
        entityId: id,
      },
    });

    // Emit real-time event for finalized submission
    this.webSocketService.emitNewSubmission(submission.hackathon.id, finalized);

    return finalized;
  }

  /**
   * Delete submission
   */
  async remove(id: string, userId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            members: true,
          },
        },
        _count: {
          select: {
            scores: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Check if user is team lead
    const member = submission.team.members.find(m => m.userId === userId);
    if (!member || member.role !== TeamMemberRole.LEAD) {
      throw new ForbiddenException('Only team lead can delete submission');
    }

    // Cannot delete if already scored
    if (submission._count.scores > 0) {
      throw new BadRequestException('Cannot delete submission that has been scored');
    }

    await this.prisma.submission.delete({
      where: { id },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'SUBMISSION_DELETE',
        entityType: 'SUBMISSION',
        entityId: id,
      },
    });

    return { success: true, message: 'Submission deleted successfully' };
  }
}
