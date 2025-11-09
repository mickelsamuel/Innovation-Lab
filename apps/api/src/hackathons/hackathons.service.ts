import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import { QueryHackathonDto } from './dto/query-hackathon.dto';
import { AnnounceWinnersDto } from './dto/announce-winners.dto';
import { HackathonStatus } from '@innovation-lab/database';
import { GamificationService, XP_POINTS } from '../gamification/gamification.service';

@Injectable()
export class HackathonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
  ) {}

  /**
   * Create new hackathon
   */
  async create(dto: CreateHackathonDto, userId: string) {
    // Check if slug already exists
    const existing = await this.prisma.hackathon.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Hackathon slug already exists');
    }

    // Validate dates
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (startsAt >= endsAt) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Create hackathon with tracks and criteria
    const hackathon = await this.prisma.hackathon.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        description: dto.description,
        coverImage: dto.coverImage,
        status: dto.status,
        location: dto.location,
        registrationOpensAt: dto.registrationOpensAt ? new Date(dto.registrationOpensAt) : null,
        registrationClosesAt: dto.registrationClosesAt
          ? new Date(dto.registrationClosesAt)
          : null,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        judgingEndsAt: dto.judgingEndsAt ? new Date(dto.judgingEndsAt) : null,
        prizePool: dto.prizePool,
        maxTeamSize: dto.maxTeamSize,
        allowSoloTeams: dto.allowSoloTeams,
        rules: dto.rules,
        tracks: dto.tracks
          ? {
              create: dto.tracks.map(track => ({
                title: track.title,
                description: track.description,
                order: track.order,
              })),
            }
          : undefined,
        criteria: dto.criteria
          ? {
              create: dto.criteria.map(criterion => ({
                name: criterion.name,
                description: criterion.description,
                maxScore: criterion.maxScore,
                weight: criterion.weight,
                order: criterion.order,
              })),
            }
          : undefined,
      },
      include: {
        tracks: true,
        criteria: true,
        _count: {
          select: {
            teams: true,
            submissions: true,
            mentors: true,
            judges: true,
          },
        },
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'HACKATHON_CREATE',
        entityType: 'HACKATHON',
        entityId: hackathon.id,
      },
    });

    return hackathon;
  }

  /**
   * Find all hackathons with filters
   */
  async findAll(query: QueryHackathonDto) {
    const { status, location, page = 1, limit = 10, search } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (location) {
      where.location = location;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [hackathons, total] = await Promise.all([
      this.prisma.hackathon.findMany({
        where,
        include: {
          tracks: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              teams: true,
              submissions: true,
              mentors: true,
              judges: true,
            },
          },
        },
        orderBy: { startsAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.hackathon.count({ where }),
    ]);

    return {
      data: hackathons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one hackathon by ID
   */
  async findOne(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: {
        tracks: {
          orderBy: { order: 'asc' },
        },
        criteria: {
          orderBy: { order: 'asc' },
        },
        mentors: {
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
        judges: {
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
        _count: {
          select: {
            teams: true,
            submissions: true,
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return hackathon;
  }

  /**
   * Find hackathon by slug
   */
  async findBySlug(slug: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { slug },
      include: {
        tracks: {
          orderBy: { order: 'asc' },
        },
        criteria: {
          orderBy: { order: 'asc' },
        },
        mentors: {
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
        judges: {
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
        announcements: {
          where: {
            publishedAt: { not: null },
          },
          orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
          take: 10,
        },
        _count: {
          select: {
            teams: true,
            submissions: true,
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return hackathon;
  }

  /**
   * Find hackathons where user has a team
   */
  async findUserHackathons(userId: string) {
    // Get all teams where user is a member
    const teams = await this.prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            hackathon: {
              select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                status: true,
                startsAt: true,
                endsAt: true,
              },
            },
          },
        },
      },
    });

    // Extract unique hackathons
    const hackathons = teams.map(tm => tm.team.hackathon);

    // Remove duplicates based on ID
    const uniqueHackathons = hackathons.filter(
      (hackathon, index, self) =>
        index === self.findIndex(h => h.id === hackathon.id)
    );

    return uniqueHackathons;
  }

  /**
   * Update hackathon
   */
  async update(id: string, dto: UpdateHackathonDto, userId: string) {
    // Check if hackathon exists
    const existing = await this.prisma.hackathon.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if slug is taken (if updating)
    if (dto.slug && dto.slug !== existing.slug) {
      const slugTaken = await this.prisma.hackathon.findUnique({
        where: { slug: dto.slug },
      });

      if (slugTaken) {
        throw new ConflictException('Hackathon slug already exists');
      }
    }

    // Update hackathon
    const hackathon = await this.prisma.hackathon.update({
      where: { id },
      data: {
        slug: dto.slug,
        title: dto.title,
        description: dto.description,
        coverImage: dto.coverImage,
        status: dto.status,
        location: dto.location,
        registrationOpensAt: dto.registrationOpensAt ? new Date(dto.registrationOpensAt) : undefined,
        registrationClosesAt: dto.registrationClosesAt
          ? new Date(dto.registrationClosesAt)
          : undefined,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        judgingEndsAt: dto.judgingEndsAt ? new Date(dto.judgingEndsAt) : undefined,
        prizePool: dto.prizePool,
        maxTeamSize: dto.maxTeamSize,
        allowSoloTeams: dto.allowSoloTeams,
        rules: dto.rules,
      },
      include: {
        tracks: true,
        criteria: true,
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'HACKATHON_UPDATE',
        entityType: 'HACKATHON',
        entityId: hackathon.id,
      },
    });

    return hackathon;
  }

  /**
   * Delete hackathon
   */
  async remove(id: string, userId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            teams: true,
            submissions: true,
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Prevent deletion if there are teams or submissions
    if (hackathon._count.teams > 0 || hackathon._count.submissions > 0) {
      throw new BadRequestException(
        'Cannot delete hackathon with existing teams or submissions'
      );
    }

    await this.prisma.hackathon.delete({
      where: { id },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'HACKATHON_DELETE',
        entityType: 'HACKATHON',
        entityId: id,
      },
    });

    return { success: true, message: 'Hackathon deleted successfully' };
  }

  /**
   * Get hackathon statistics
   */
  async getStats(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            teams: true,
            submissions: true,
            mentors: true,
            judges: true,
            tracks: true,
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Get submission status breakdown
    const submissionsByStatus = await this.prisma.submission.groupBy({
      by: ['status'],
      where: { hackathonId: id },
      _count: true,
    });

    // Get total participants
    const participants = await this.prisma.teamMember.count({
      where: {
        team: {
          hackathonId: id,
        },
      },
    });

    return {
      ...hackathon._count,
      participants,
      submissionsByStatus,
      prizePool: hackathon.prizePool,
    };
  }

  /**
   * Announce hackathon winners and award XP
   */
  async announceWinners(hackathonId: string, dto: AnnounceWinnersDto, userId: string) {
    // Verify hackathon exists
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Verify hackathon is in judging or completed status
    if (hackathon.status !== HackathonStatus.JUDGING && hackathon.status !== HackathonStatus.CLOSED) {
      throw new BadRequestException('Hackathon must be in JUDGING or COMPLETED status to announce winners');
    }

    const results = [];

    for (const winner of dto.winners) {
      // Verify submission exists and belongs to this hackathon
      const submission = await this.prisma.submission.findUnique({
        where: { id: winner.submissionId },
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!submission) {
        throw new NotFoundException(`Submission ${winner.submissionId} not found`);
      }

      if (submission.hackathonId !== hackathonId) {
        throw new BadRequestException(`Submission ${winner.submissionId} does not belong to this hackathon`);
      }

      // Update submission with winner rank
      await this.prisma.submission.update({
        where: { id: winner.submissionId },
        data: {
          rank: winner.rank,
        },
      });

      // Determine XP amount based on rank
      let xpPoints: number;
      let xpEventType: string;
      switch (winner.rank) {
        case 1:
          xpPoints = XP_POINTS.WIN_HACKATHON_1ST;
          xpEventType = 'WIN_HACKATHON_1ST';
          break;
        case 2:
          xpPoints = XP_POINTS.WIN_HACKATHON_2ND;
          xpEventType = 'WIN_HACKATHON_2ND';
          break;
        case 3:
          xpPoints = XP_POINTS.WIN_HACKATHON_3RD;
          xpEventType = 'WIN_HACKATHON_3RD';
          break;
        default:
          xpPoints = 0;
          xpEventType = 'UNKNOWN';
      }

      // Award XP to all team members
      for (const member of submission.team.members) {
        await this.gamificationService.awardXp(
          member.userId,
          xpEventType,
          xpPoints,
          'submission',
          submission.id,
        );
      }

      results.push({
        submissionId: winner.submissionId,
        rank: winner.rank,
        teamName: submission.team.name,
        xpAwarded: xpPoints,
        membersAwarded: submission.team.members.length,
      });
    }

    // Update hackathon status to COMPLETED
    await this.prisma.hackathon.update({
      where: { id: hackathonId },
      data: {
        status: HackathonStatus.CLOSED,
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'WINNERS_ANNOUNCE',
        entityType: 'HACKATHON',
        entityId: hackathonId,
        metadata: {
          winners: results,
        },
      },
    });

    return {
      success: true,
      message: 'Winners announced successfully',
      results,
    };
  }

  /**
   * Create a hackathon announcement
   */
  async createAnnouncement(hackathonId: string, dto: any, userId: string) {
    // Verify hackathon exists and user has permission
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Create announcement
    const announcement = await this.prisma.announcement.create({
      data: {
        scope: 'HACKATHON',
        scopeId: hackathonId,
        title: dto.title,
        body: dto.body,
        pinned: dto.pinned || false,
        publishedAt: new Date(),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'ANNOUNCEMENT_CREATE',
        entityType: 'Hackathon',
        entityId: hackathonId,
        metadata: { announcementId: announcement.id, title: dto.title },
      },
    });

    return announcement;
  }

  /**
   * Get all announcements for a hackathon
   */
  async getAnnouncements(hackathonId: string) {
    return this.prisma.announcement.findMany({
      where: {
        scope: 'HACKATHON',
        scopeId: hackathonId,
        publishedAt: { not: null },
      },
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
    });
  }

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(
    hackathonId: string,
    announcementId: string,
    userId: string,
  ) {
    // Verify announcement exists and belongs to this hackathon
    const announcement = await this.prisma.announcement.findFirst({
      where: {
        id: announcementId,
        scope: 'HACKATHON',
        scopeId: hackathonId,
      },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Delete announcement
    await this.prisma.announcement.delete({
      where: { id: announcementId },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'ANNOUNCEMENT_DELETE',
        entityType: 'Hackathon',
        entityId: hackathonId,
        metadata: { announcementId, title: announcement.title },
      },
    });

    return { success: true, message: 'Announcement deleted successfully' };
  }

  /**
   * Register a participant for a hackathon
   */
  async registerParticipant(hackathonId: string, userId: string): Promise<void> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        status: true,
        registrationClosesAt: true,
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    if (hackathon.status === HackathonStatus.CLOSED) {
      throw new BadRequestException('Hackathon registration is closed');
    }

    if (hackathon.registrationClosesAt && new Date() > hackathon.registrationClosesAt) {
      throw new BadRequestException('Registration deadline has passed');
    }

    // Check if already registered
    const existing = await this.prisma.hackathonParticipant.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Already registered for this hackathon');
    }

    await this.prisma.$transaction([
      // Create registration
      this.prisma.hackathonParticipant.create({
        data: {
          hackathonId,
          userId,
          registeredAt: new Date(),
        },
      }),

      // Award XP
      this.prisma.xpEvent.create({
        data: {
          userId,
          eventType: 'HACKATHON_REGISTRATION',
          points: XP_POINTS.JOIN_HACKATHON,
          refType: 'hackathon',
          refId: hackathonId,
        },
      }),

      // Create audit log
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          action: 'HACKATHON_REGISTER',
          entityType: 'hackathon',
          entityId: hackathonId,
        },
      }),
    ]);

    // Update gamification profile
    await this.gamificationService.awardXp(
      userId,
      'HACKATHON_REGISTRATION',
      XP_POINTS.JOIN_HACKATHON,
      'hackathon',
      hackathonId,
    );
  }

  async getHackathonSubmissions(hackathonId: string, status?: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    const where: any = { hackathonId };
    if (status) {
      where.status = status;
    }

    const submissions = await this.prisma.submission.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            members: {
              select: {
                userId: true,
                role: true,
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
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions;
  }
}
