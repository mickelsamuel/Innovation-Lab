import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AssignMentorDto } from './dto/assign-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { Role } from '@innovation-lab/database';

@Injectable()
export class MentorsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Assign a mentor to a hackathon
   */
  async assignMentor(hackathonId: string, dto: AssignMentorDto, assignerId: string) {
    // Verify hackathon exists
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Verify user exists and has MENTOR role
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.roles.includes(Role.MENTOR) && !user.roles.includes(Role.BANK_ADMIN)) {
      throw new BadRequestException('User must have MENTOR or BANK_ADMIN role');
    }

    // Check if already assigned
    const existing = await this.prisma.mentor.findUnique({
      where: {
        userId_hackathonId: {
          hackathonId,
          userId: dto.userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Mentor already assigned to this hackathon');
    }

    // Assign mentor
    const mentor = await this.prisma.mentor.create({
      data: {
        hackathonId,
        userId: dto.userId,
        bio: dto.bio,
        calendlyUrl: dto.calendlyUrl,
        expertise: dto.expertise || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: assignerId,
        action: 'MENTOR_ASSIGN',
        entityType: 'MENTOR',
        entityId: mentor.id,
        metadata: {
          hackathonId,
          mentorUserId: dto.userId,
        },
      },
    });

    return mentor;
  }

  /**
   * Get all mentors for a hackathon
   */
  async getMentors(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return this.prisma.mentor.findMany({
      where: { hackathonId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
        sessions: {
          where: {
            startsAt: {
              gte: new Date(),
            },
          },
          orderBy: {
            startsAt: 'asc',
          },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });
  }

  /**
   * Remove a mentor from a hackathon
   */
  async removeMentor(hackathonId: string, userId: string, removerId: string) {
    const mentor = await this.prisma.mentor.findUnique({
      where: {
        userId_hackathonId: {
          hackathonId,
          userId,
        },
      },
      include: {
        sessions: true,
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor assignment not found');
    }

    // Check if mentor has upcoming sessions
    const upcomingSessions = mentor.sessions.filter(
      session => new Date(session.startsAt) > new Date()
    );

    if (upcomingSessions.length > 0) {
      throw new BadRequestException(
        `Cannot remove mentor with ${upcomingSessions.length} upcoming session(s). Cancel sessions first.`
      );
    }

    await this.prisma.mentor.delete({
      where: { id: mentor.id },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: removerId,
        action: 'MENTOR_REMOVE',
        entityType: 'MENTOR',
        entityId: mentor.id,
        metadata: {
          hackathonId,
          mentorUserId: userId,
        },
      },
    });

    return { success: true, message: 'Mentor removed successfully' };
  }

  /**
   * Update mentor profile
   */
  async updateMentor(hackathonId: string, userId: string, dto: UpdateMentorDto, actorId: string) {
    const mentor = await this.prisma.mentor.findUnique({
      where: {
        userId_hackathonId: {
          hackathonId,
          userId,
        },
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor assignment not found');
    }

    const updated = await this.prisma.mentor.update({
      where: { id: mentor.id },
      data: {
        bio: dto.bio,
        calendlyUrl: dto.calendlyUrl,
        expertise: dto.expertise,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'MENTOR_UPDATE',
        entityType: 'MENTOR',
        entityId: mentor.id,
      },
    });

    return updated;
  }

  /**
   * Get hackathons where user is a mentor
   */
  async getMentorAssignments(mentorUserId: string) {
    const mentors = await this.prisma.mentor.findMany({
      where: { userId: mentorUserId },
      include: {
        hackathon: {
          include: {
            _count: {
              select: {
                teams: true,
                submissions: true,
              },
            },
          },
        },
        sessions: {
          where: {
            startsAt: {
              gte: new Date(),
            },
          },
          orderBy: {
            startsAt: 'asc',
          },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return mentors;
  }

  /**
   * Create a mentor session (office hours)
   */
  async createSession(mentorId: string, dto: CreateSessionDto, actorId: string) {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        hackathon: true,
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    // Verify actor is the mentor or an admin
    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
    });

    if (!actor) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = actor.roles.includes(Role.BANK_ADMIN) || actor.roles.includes(Role.ORGANIZER);
    const isMentor = mentor.userId === actorId;

    if (!isAdmin && !isMentor) {
      throw new ForbiddenException('Only the mentor or admins can create sessions');
    }

    // Validate dates
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (startsAt >= endsAt) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (startsAt < new Date()) {
      throw new BadRequestException('Cannot create sessions in the past');
    }

    // Check for scheduling conflicts
    const conflicts = await this.prisma.mentorSession.findMany({
      where: {
        mentorId,
        OR: [
          {
            AND: [{ startsAt: { lte: startsAt } }, { endsAt: { gte: startsAt } }],
          },
          {
            AND: [{ startsAt: { lte: endsAt } }, { endsAt: { gte: endsAt } }],
          },
          {
            AND: [{ startsAt: { gte: startsAt } }, { endsAt: { lte: endsAt } }],
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      throw new ConflictException('This time slot conflicts with an existing session');
    }

    const session = await this.prisma.mentorSession.create({
      data: {
        mentorId,
        title: dto.title,
        startsAt,
        endsAt,
        capacity: dto.capacity || 10,
        meetingUrl: dto.meetingUrl,
      },
      include: {
        mentor: {
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
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'MENTOR_SESSION_CREATE',
        entityType: 'MENTOR_SESSION',
        entityId: session.id,
        metadata: {
          mentorId,
          startsAt: dto.startsAt,
          endsAt: dto.endsAt,
        },
      },
    });

    return session;
  }

  /**
   * Get sessions for a mentor
   */
  async getMentorSessions(mentorId: string, includeAll = false) {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    const where: Record<string, unknown> = { mentorId };

    // By default, only show upcoming sessions
    if (!includeAll) {
      where.startsAt = {
        gte: new Date(),
      };
    }

    return this.prisma.mentorSession.findMany({
      where,
      orderBy: {
        startsAt: 'asc',
      },
    });
  }

  /**
   * Delete a mentor session
   */
  async deleteSession(sessionId: string, actorId: string) {
    const session = await this.prisma.mentorSession.findUnique({
      where: { id: sessionId },
      include: {
        mentor: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Verify actor is the mentor or an admin
    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
    });

    if (!actor) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = actor.roles.includes(Role.BANK_ADMIN) || actor.roles.includes(Role.ORGANIZER);
    const isMentor = session.mentor.userId === actorId;

    if (!isAdmin && !isMentor) {
      throw new ForbiddenException('Only the mentor or admins can delete sessions');
    }

    // Don't allow deleting sessions that are currently in progress
    const now = new Date();
    if (session.startsAt <= now && session.endsAt >= now) {
      throw new BadRequestException('Cannot delete a session that is currently in progress');
    }

    await this.prisma.mentorSession.delete({
      where: { id: sessionId },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'MENTOR_SESSION_DELETE',
        entityType: 'MENTOR_SESSION',
        entityId: sessionId,
      },
    });

    return { success: true, message: 'Session deleted successfully' };
  }

  /**
   * Get all upcoming sessions for a hackathon
   */
  async getHackathonSessions(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return this.prisma.mentorSession.findMany({
      where: {
        mentor: {
          hackathonId,
        },
        startsAt: {
          gte: new Date(),
        },
      },
      include: {
        mentor: {
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
      orderBy: {
        startsAt: 'asc',
      },
    });
  }
}
