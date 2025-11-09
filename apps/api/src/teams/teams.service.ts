import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { TeamMemberRole } from '@innovation-lab/database';
import { GamificationService, XP_POINTS } from '../gamification/gamification.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Create new team
   */
  async create(dto: CreateTeamDto, userId: string) {
    // Check if hackathon exists
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: dto.hackathonId },
      select: { id: true, maxTeamSize: true, allowSoloTeams: true, status: true },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if user is already in a team for this hackathon
    const existingTeam = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        team: {
          hackathonId: dto.hackathonId,
        },
      },
    });

    if (existingTeam) {
      throw new ConflictException('You are already part of a team in this hackathon');
    }

    // Create team with creator as lead
    const team = await this.prisma.team.create({
      data: {
        hackathonId: dto.hackathonId,
        name: dto.name,
        bio: dto.bio,
        logoUrl: dto.logoUrl,
        repoUrl: dto.repoUrl,
        demoUrl: dto.demoUrl,
        members: {
          create: {
            userId,
            role: TeamMemberRole.LEAD,
          },
        },
      },
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
        hackathon: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // Award XP for joining hackathon
    await this.gamificationService.awardXp(
      userId,
      'JOIN_HACKATHON',
      XP_POINTS.JOIN_HACKATHON,
      'hackathon',
      dto.hackathonId,
    );

    // Award XP for creating team
    await this.gamificationService.awardXp(
      userId,
      'CREATE_TEAM',
      XP_POINTS.CREATE_TEAM,
      'team',
      team.id,
    );

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'TEAM_CREATE',
        entityType: 'TEAM',
        entityId: team.id,
      },
    });

    return team;
  }

  /**
   * Find all teams for a hackathon
   */
  async findAll(hackathonId: string) {
    const teams = await this.prisma.team.findMany({
      where: { hackathonId },
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
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return teams;
  }

  /**
   * Find one team by ID
   */
  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
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
                organization: true,
              },
            },
          },
        },
        hackathon: {
          select: {
            id: true,
            title: true,
            slug: true,
            maxTeamSize: true,
            status: true,
          },
        },
        submissions: {
          select: {
            id: true,
            title: true,
            status: true,
            submittedAt: true,
            scoreAggregate: true,
            rank: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  /**
   * Find all teams where user is a member
   */
  async findUserTeams(userId: string, hackathonId?: string) {
    const teamMembers = await this.prisma.teamMember.findMany({
      where: {
        userId,
        ...(hackathonId && {
          team: {
            hackathonId
          }
        })
      },
      include: {
        team: {
          include: {
            hackathon: {
              select: {
                id: true,
                title: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    // Transform to include role
    return teamMembers.map(tm => ({
      id: tm.team.id,
      name: tm.team.name,
      bio: tm.team.bio,
      role: tm.role,
      hackathon: tm.team.hackathon,
      _count: tm.team._count,
    }));
  }

  /**
   * Update team
   */
  async update(id: string, dto: UpdateTeamDto, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user is team lead
    const member = team.members.find(m => m.userId === userId);
    if (!member || member.role !== TeamMemberRole.LEAD) {
      throw new ForbiddenException('Only team lead can update team details');
    }

    const updatedTeam = await this.prisma.team.update({
      where: { id },
      data: {
        name: dto.name,
        bio: dto.bio,
        logoUrl: dto.logoUrl,
        repoUrl: dto.repoUrl,
        demoUrl: dto.demoUrl,
      },
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
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'TEAM_UPDATE',
        entityType: 'TEAM',
        entityId: id,
      },
    });

    return updatedTeam;
  }

  /**
   * Add member to team
   */
  async addMember(teamId: string, dto: InviteMemberDto, inviterId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        hackathon: {
          select: {
            id: true,
            maxTeamSize: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if inviter is team lead
    const inviter = team.members.find(m => m.userId === inviterId);
    if (!inviter || inviter.role !== TeamMemberRole.LEAD) {
      throw new ForbiddenException('Only team lead can invite members');
    }

    // Check if user is already a member
    const existingMember = team.members.find(m => m.userId === dto.userId);
    if (existingMember) {
      throw new ConflictException('User is already a team member');
    }

    // Check if user is in another team for this hackathon
    const otherTeam = await this.prisma.teamMember.findFirst({
      where: {
        userId: dto.userId,
        team: {
          hackathonId: team.hackathon.id,
        },
      },
    });

    if (otherTeam) {
      throw new ConflictException('User is already in another team for this hackathon');
    }

    // Use transaction to prevent race condition on team size limit
    await this.prisma.$transaction(async (tx) => {
      // Atomic count check inside transaction
      const currentMemberCount = await tx.teamMember.count({
        where: { teamId },
      });

      if (currentMemberCount >= team.hackathon.maxTeamSize) {
        throw new BadRequestException('Team is full');
      }

      // Add member
      await tx.teamMember.create({
        data: {
          teamId,
          userId: dto.userId,
          role: dto.role,
        },
      });

      // Log audit
      await tx.auditLog.create({
        data: {
          actorId: inviterId,
          action: 'TEAM_MEMBER_ADD',
          entityType: 'TEAM',
          entityId: teamId,
          metadata: { userId: dto.userId },
        },
      });
    });

    // Award XP for joining hackathon (outside transaction to avoid long locks)
    await this.gamificationService.awardXp(
      dto.userId,
      'JOIN_HACKATHON',
      XP_POINTS.JOIN_HACKATHON,
      'hackathon',
      team.hackathon.id,
    );

    // Award XP for joining team
    await this.gamificationService.awardXp(
      dto.userId,
      'JOIN_TEAM',
      XP_POINTS.JOIN_TEAM,
      'team',
      teamId,
    );

    return this.findOne(teamId);
  }

  /**
   * Remove member from team
   */
  async removeMember(teamId: string, userId: string, requesterId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if requester is team lead or removing themselves
    const requester = team.members.find(m => m.userId === requesterId);
    const isSelfRemoval = userId === requesterId;
    const isLead = requester?.role === TeamMemberRole.LEAD;

    if (!isSelfRemoval && !isLead) {
      throw new ForbiddenException('Only team lead can remove members');
    }

    // Cannot remove the lead unless they're removing themselves
    const member = team.members.find(m => m.userId === userId);
    if (member?.role === TeamMemberRole.LEAD && !isSelfRemoval) {
      throw new BadRequestException('Cannot remove team lead');
    }

    // Remove member
    await this.prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    // If lead left and there are other members, promote one
    if (isSelfRemoval && member?.role === TeamMemberRole.LEAD) {
      const remainingMembers = team.members.filter(m => m.userId !== userId);
      if (remainingMembers.length > 0) {
        await this.prisma.teamMember.update({
          where: {
            teamId_userId: {
              teamId,
              userId: remainingMembers[0].userId,
            },
          },
          data: {
            role: TeamMemberRole.LEAD,
          },
        });
      } else {
        // No members left, delete team
        await this.prisma.team.delete({
          where: { id: teamId },
        });
        return { success: true, message: 'Team deleted as last member left' };
      }
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: requesterId,
        action: 'TEAM_MEMBER_REMOVE',
        entityType: 'TEAM',
        entityId: teamId,
        metadata: { userId },
      },
    });

    return { success: true, message: 'Member removed successfully' };
  }

  /**
   * Delete team
   */
  async remove(id: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user is team lead
    const member = team.members.find(m => m.userId === userId);
    if (!member || member.role !== TeamMemberRole.LEAD) {
      throw new ForbiddenException('Only team lead can delete team');
    }

    // Prevent deletion if there are submissions
    if (team._count.submissions > 0) {
      throw new BadRequestException('Cannot delete team with existing submissions');
    }

    await this.prisma.team.delete({
      where: { id },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'TEAM_DELETE',
        entityType: 'TEAM',
        entityId: id,
      },
    });

    return { success: true, message: 'Team deleted successfully' };
  }

  /**
   * Handle team join request
   * Sends notification to team lead when someone wants to join
   */
  async handleJoinRequest(teamId: string, userId: string, message?: string) {
    // Validate team exists and is accepting members
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { include: { user: true } },
        hackathon: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.lookingForMembers) {
      throw new BadRequestException('This team is not looking for members');
    }

    const maxSize = team.hackathon.maxTeamSize || 4;
    if (team.members.length >= maxSize) {
      throw new BadRequestException('Team is full');
    }

    // Check if already a member
    if (team.members.some((m) => m.userId === userId)) {
      throw new BadRequestException('You are already a member of this team');
    }

    // Find team lead
    const teamLead = team.members.find((m) => m.role === 'LEAD');
    if (!teamLead) {
      throw new InternalServerErrorException('Team has no lead');
    }

    // Get requester info
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, handle: true },
    });

    if (!requester) {
      throw new NotFoundException('User not found');
    }

    // Create notification for team lead
    await this.notificationsService.createNotification({
      userId: teamLead.userId,
      type: 'TEAM_JOIN_REQUEST',
      title: `Join Request for ${team.name}`,
      message: `${requester.name} (@${requester.handle}) wants to join your team${message ? ': ' + message : ''}`,
      link: `/teams/${teamId}`,
      data: {
        teamId,
        requesterId: userId,
        requesterName: requester.name,
        requesterHandle: requester.handle,
        message,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'TEAM_JOIN_REQUEST',
        entityType: 'Team',
        entityId: teamId,
        metadata: { message, teamName: team.name },
      },
    });

    return {
      success: true,
      message: 'Join request sent to team lead',
    };
  }
}
