import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { GamificationService, XP_POINTS } from '../gamification/gamification.service';
import { SendInvitationDto } from './dto/send-invitation.dto';
import { InvitationStatus, TeamMemberRole } from '@innovation-lab/database';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly gamificationService: GamificationService
  ) {}

  /**
   * Send a team invitation
   */
  async sendInvitation(teamId: string, dto: SendInvitationDto, senderId: string) {
    // Validate that either inviteeId or inviteeEmail is provided
    if (!dto.inviteeId && !dto.inviteeEmail) {
      throw new BadRequestException('Either inviteeId or inviteeEmail must be provided');
    }

    // Check if team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        hackathon: {
          select: {
            id: true,
            title: true,
            slug: true,
            maxTeamSize: true,
            status: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if sender is team lead
    const sender = team.members.find(m => m.userId === senderId);
    if (!sender || sender.role !== TeamMemberRole.LEAD) {
      throw new ForbiddenException('Only team lead can send invitations');
    }

    // Check if team is full
    if (team.members.length >= team.hackathon.maxTeamSize) {
      throw new BadRequestException('Team is full');
    }

    // If inviting by userId, check if user exists
    let invitee = null;
    if (dto.inviteeId) {
      invitee = await this.prisma.user.findUnique({
        where: { id: dto.inviteeId },
        select: {
          id: true,
          email: true,
          name: true,
          handle: true,
        },
      });

      if (!invitee) {
        throw new NotFoundException('User not found');
      }

      // Check if user is already a member
      const existingMember = team.members.find(m => m.userId === dto.inviteeId);
      if (existingMember) {
        throw new ConflictException('User is already a team member');
      }

      // Check if user is in another team for this hackathon
      const otherTeam = await this.prisma.teamMember.findFirst({
        where: {
          userId: dto.inviteeId,
          team: {
            hackathonId: team.hackathon.id,
          },
        },
      });

      if (otherTeam) {
        throw new ConflictException('User is already in another team for this hackathon');
      }
    }

    // Check for duplicate pending invitations
    const duplicateInvitation = await this.prisma.teamInvitation.findFirst({
      where: {
        teamId,
        status: InvitationStatus.PENDING,
        OR: [{ inviteeId: dto.inviteeId }, { inviteeEmail: dto.inviteeEmail }],
      },
    });

    if (duplicateInvitation) {
      throw new ConflictException('An invitation has already been sent to this user');
    }

    // Get sender info
    const senderUser = await this.prisma.user.findUnique({
      where: { id: senderId },
      select: {
        name: true,
        handle: true,
      },
    });

    // Create invitation with 7-day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.teamInvitation.create({
      data: {
        teamId,
        invitedById: senderId,
        inviteeId: dto.inviteeId,
        inviteeEmail: dto.inviteeEmail || invitee?.email,
        role: dto.role,
        status: InvitationStatus.PENDING,
        expiresAt,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            hackathon: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            handle: true,
          },
        },
        invitee: {
          select: {
            id: true,
            name: true,
            handle: true,
            email: true,
          },
        },
      },
    });

    // Send email notification
    if (invitation.inviteeEmail && senderUser) {
      try {
        await this.emailService.sendTeamInvitationEmail(
          invitation.inviteeEmail,
          invitee?.name || 'there',
          team.name,
          senderUser.name || senderUser.handle || 'Team Lead',
          team.hackathon.title,
          team.hackathon.slug
        );
      } catch (error) {
        console.error('Failed to send invitation email:', error);
        // Don't fail the invitation if email fails
      }
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: senderId,
        action: 'TEAM_INVITATION_SEND',
        entityType: 'TEAM_INVITATION',
        entityId: invitation.id,
        metadata: {
          teamId,
          inviteeId: dto.inviteeId,
          inviteeEmail: dto.inviteeEmail,
        },
      },
    });

    return invitation;
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(invitationId: string, userId: string) {
    // Get invitation
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: {
        team: {
          include: {
            members: true,
            hackathon: {
              select: {
                id: true,
                maxTeamSize: true,
              },
            },
          },
        },
        invitee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify user is the invitee
    if (invitation.inviteeId && invitation.inviteeId !== userId) {
      throw new ForbiddenException('You are not authorized to accept this invitation');
    }

    // Check if invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('This invitation has already been processed');
    }

    // Check if invitation has expired
    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      await this.prisma.teamInvitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('This invitation has expired');
    }

    // Check if user is already in another team for this hackathon
    const otherTeam = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        team: {
          hackathonId: invitation.team.hackathonId,
        },
      },
    });

    if (otherTeam) {
      throw new ConflictException('You are already in another team for this hackathon');
    }

    // Accept invitation and add to team (with atomic team size check)
    await this.prisma.$transaction(async tx => {
      // Atomic count check inside transaction to prevent race condition
      const currentMemberCount = await tx.teamMember.count({
        where: { teamId: invitation.teamId },
      });

      if (currentMemberCount >= invitation.team.hackathon.maxTeamSize) {
        throw new BadRequestException('Team is full');
      }

      // Update invitation status
      await tx.teamInvitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.ACCEPTED },
      });

      // Add member to team
      await tx.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId,
          role: invitation.role,
        },
      });
    });

    // Award XP for joining hackathon (if first time)
    const existingHackathonXp = await this.prisma.xpEvent.findFirst({
      where: {
        userId,
        eventType: 'JOIN_HACKATHON',
        refId: invitation.team.hackathon.id,
      },
    });

    if (!existingHackathonXp) {
      await this.gamificationService.awardXp(
        userId,
        'JOIN_HACKATHON',
        XP_POINTS.JOIN_HACKATHON,
        'hackathon',
        invitation.team.hackathon.id
      );
    }

    // Award XP for joining team
    await this.gamificationService.awardXp(
      userId,
      'JOIN_TEAM',
      XP_POINTS.JOIN_TEAM,
      'team',
      invitation.teamId
    );

    // Send acceptance email to inviter
    try {
      const inviter = await this.prisma.user.findUnique({
        where: { id: invitation.invitedById },
        select: { email: true, name: true },
      });

      if (inviter && inviter.email) {
        await this.emailService.sendTeamInvitationAcceptedEmail(
          inviter.email,
          inviter.name || 'Team Lead',
          invitation.invitee?.name || 'A user',
          invitation.team.name
        );
      }
    } catch (error) {
      console.error('Failed to send acceptance email:', error);
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'TEAM_INVITATION_ACCEPT',
        entityType: 'TEAM_INVITATION',
        entityId: invitationId,
      },
    });

    return this.getTeamInvitations(invitation.teamId);
  }

  /**
   * Reject an invitation
   */
  async rejectInvitation(invitationId: string, userId: string) {
    // Get invitation
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify user is the invitee
    if (invitation.inviteeId && invitation.inviteeId !== userId) {
      throw new ForbiddenException('You are not authorized to reject this invitation');
    }

    // Check if invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('This invitation has already been processed');
    }

    // Reject invitation
    await this.prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.REJECTED },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'TEAM_INVITATION_REJECT',
        entityType: 'TEAM_INVITATION',
        entityId: invitationId,
      },
    });

    return { success: true, message: 'Invitation rejected' };
  }

  /**
   * Cancel an invitation (sender only)
   */
  async cancelInvitation(invitationId: string, senderId: string) {
    // Get invitation
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify sender is the one who sent the invitation
    if (invitation.invitedById !== senderId) {
      throw new ForbiddenException('You are not authorized to cancel this invitation');
    }

    // Check if invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('This invitation has already been processed');
    }

    // Delete invitation
    await this.prisma.teamInvitation.delete({
      where: { id: invitationId },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: senderId,
        action: 'TEAM_INVITATION_CANCEL',
        entityType: 'TEAM_INVITATION',
        entityId: invitationId,
      },
    });

    return { success: true, message: 'Invitation cancelled' };
  }

  /**
   * Get all invitations for a team
   */
  async getTeamInvitations(teamId: string) {
    const invitations = await this.prisma.teamInvitation.findMany({
      where: { teamId },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
        invitee: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Mark expired invitations
    const now = new Date();
    for (const invitation of invitations) {
      if (
        invitation.status === InvitationStatus.PENDING &&
        invitation.expiresAt &&
        now > invitation.expiresAt
      ) {
        await this.prisma.teamInvitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });
        invitation.status = InvitationStatus.EXPIRED;
      }
    }

    return invitations;
  }

  /**
   * Get all invitations for a user
   */
  async getUserInvitations(userId: string) {
    // Get user's email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const invitations = await this.prisma.teamInvitation.findMany({
      where: {
        OR: [{ inviteeId: userId }, { inviteeEmail: user.email }],
        status: InvitationStatus.PENDING,
      },
      include: {
        team: {
          include: {
            hackathon: {
              select: {
                id: true,
                title: true,
                slug: true,
                maxTeamSize: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Mark expired invitations and filter them out
    const now = new Date();
    const validInvitations = [];

    for (const invitation of invitations) {
      if (invitation.expiresAt && now > invitation.expiresAt) {
        await this.prisma.teamInvitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });
      } else {
        validInvitations.push(invitation);
      }
    }

    return validInvitations;
  }
}
