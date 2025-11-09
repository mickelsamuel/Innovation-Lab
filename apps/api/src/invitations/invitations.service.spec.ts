import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from './invitations.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { GamificationService } from '../gamification/gamification.service';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TeamMemberRole, InvitationStatus } from '@innovation-lab/database';

describe('InvitationsService', () => {
  let service: InvitationsService;

  const mockPrismaService = {
    team: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    teamMember: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    teamInvitation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    xpEvent: {
      findFirst: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockEmailService = {
    sendTeamInvitationEmail: jest.fn(),
    sendEmail: jest.fn(),
  };

  const mockGamificationService = {
    awardXp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: GamificationService,
          useValue: mockGamificationService,
        },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendInvitation', () => {
    const teamId = 'team-1';
    const senderId = 'sender-1';
    const inviteeId = 'invitee-1';

    const mockTeam = {
      id: teamId,
      name: 'Test Team',
      members: [
        { userId: senderId, role: TeamMemberRole.LEAD },
      ],
      hackathon: {
        id: 'hackathon-1',
        title: 'Test Hackathon',
        slug: 'test-hackathon',
        maxTeamSize: 4,
        status: 'LIVE',
      },
    };

    const mockInvitee = {
      id: inviteeId,
      email: 'invitee@test.com',
      name: 'Invitee User',
      handle: 'invitee',
    };

    const mockSender = {
      name: 'Sender User',
      handle: 'sender',
    };

    it('should send invitation successfully', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockInvitee)
        .mockResolvedValueOnce(mockSender);
      mockPrismaService.teamMember.findFirst.mockResolvedValue(null);
      mockPrismaService.teamInvitation.findFirst.mockResolvedValue(null);
      mockPrismaService.teamInvitation.create.mockResolvedValue({
        id: 'invitation-1',
        teamId,
        invitedById: senderId,
        inviteeId,
        inviteeEmail: mockInvitee.email,
        role: TeamMemberRole.MEMBER,
        status: InvitationStatus.PENDING,
        expiresAt: new Date(),
        team: mockTeam,
        invitedBy: mockSender,
        invitee: mockInvitee,
      });
      mockEmailService.sendTeamInvitationEmail.mockResolvedValue(undefined);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.sendInvitation(
        teamId,
        { inviteeId, role: TeamMemberRole.MEMBER },
        senderId,
      );

      expect(result).toBeDefined();
      expect(result.inviteeId).toBe(inviteeId);
      expect(mockEmailService.sendTeamInvitationEmail).toHaveBeenCalled();
    });

    it('should throw NotFoundException if team not found', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(null);

      await expect(
        service.sendInvitation(teamId, { inviteeId, role: TeamMemberRole.MEMBER }, senderId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if sender is not team lead', async () => {
      const nonLeadTeam = {
        ...mockTeam,
        members: [{ userId: senderId, role: TeamMemberRole.MEMBER }],
      };
      mockPrismaService.team.findUnique.mockResolvedValue(nonLeadTeam);

      await expect(
        service.sendInvitation(teamId, { inviteeId, role: TeamMemberRole.MEMBER }, senderId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if team is full', async () => {
      const fullTeam = {
        ...mockTeam,
        members: [
          { userId: senderId, role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
          { userId: 'user-3', role: TeamMemberRole.MEMBER },
          { userId: 'user-4', role: TeamMemberRole.MEMBER },
        ],
      };
      mockPrismaService.team.findUnique.mockResolvedValue(fullTeam);

      await expect(
        service.sendInvitation(teamId, { inviteeId, role: TeamMemberRole.MEMBER }, senderId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user is already a member', async () => {
      const teamWithInvitee = {
        ...mockTeam,
        members: [
          { userId: senderId, role: TeamMemberRole.LEAD },
          { userId: inviteeId, role: TeamMemberRole.MEMBER },
        ],
      };
      mockPrismaService.team.findUnique.mockResolvedValue(teamWithInvitee);
      mockPrismaService.user.findUnique.mockResolvedValue(mockInvitee);

      await expect(
        service.sendInvitation(teamId, { inviteeId, role: TeamMemberRole.MEMBER }, senderId),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate invitation', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.user.findUnique.mockResolvedValue(mockInvitee);
      mockPrismaService.teamMember.findFirst.mockResolvedValue(null);
      mockPrismaService.teamInvitation.findFirst.mockResolvedValue({
        id: 'existing-invitation',
        status: InvitationStatus.PENDING,
      });

      await expect(
        service.sendInvitation(teamId, { inviteeId, role: TeamMemberRole.MEMBER }, senderId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('acceptInvitation', () => {
    const invitationId = 'invitation-1';
    const userId = 'user-1';

    const mockInvitation = {
      id: invitationId,
      teamId: 'team-1',
      inviteeId: userId,
      inviteeEmail: 'user@test.com',
      role: TeamMemberRole.MEMBER,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 86400000), // Tomorrow
      invitedById: 'sender-1',
      team: {
        id: 'team-1',
        name: 'Test Team',
        hackathonId: 'hackathon-1',
        members: [
          { userId: 'sender-1', role: TeamMemberRole.LEAD },
        ],
        hackathon: {
          id: 'hackathon-1',
          maxTeamSize: 4,
        },
      },
      invitee: {
        id: userId,
        email: 'user@test.com',
        name: 'Test User',
      },
    };

    it('should accept invitation successfully', async () => {
      mockPrismaService.teamInvitation.findUnique.mockResolvedValue(mockInvitation);
      mockPrismaService.teamMember.findFirst.mockResolvedValue(null);
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);
      mockPrismaService.xpEvent.findFirst.mockResolvedValue(null);
      mockGamificationService.awardXp.mockResolvedValue(undefined);
      mockPrismaService.user.findUnique.mockResolvedValue({
        email: 'sender@test.com',
        name: 'Sender',
      });
      mockEmailService.sendEmail.mockResolvedValue(undefined);
      mockPrismaService.auditLog.create.mockResolvedValue({});
      mockPrismaService.teamInvitation.findMany.mockResolvedValue([]);

      await service.acceptInvitation(invitationId, userId);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockGamificationService.awardXp).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if invitation not found', async () => {
      mockPrismaService.teamInvitation.findUnique.mockResolvedValue(null);

      await expect(service.acceptInvitation(invitationId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the invitee', async () => {
      const wrongUserInvitation = {
        ...mockInvitation,
        inviteeId: 'different-user',
      };
      mockPrismaService.teamInvitation.findUnique.mockResolvedValue(wrongUserInvitation);

      await expect(service.acceptInvitation(invitationId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if invitation already processed', async () => {
      const acceptedInvitation = {
        ...mockInvitation,
        status: InvitationStatus.ACCEPTED,
      };
      mockPrismaService.teamInvitation.findUnique.mockResolvedValue(acceptedInvitation);

      await expect(service.acceptInvitation(invitationId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if invitation expired', async () => {
      const expiredInvitation = {
        ...mockInvitation,
        expiresAt: new Date(Date.now() - 86400000), // Yesterday
      };
      mockPrismaService.teamInvitation.findUnique.mockResolvedValue(expiredInvitation);
      mockPrismaService.teamInvitation.update.mockResolvedValue({});

      await expect(service.acceptInvitation(invitationId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('rejectInvitation', () => {
    const invitationId = 'invitation-1';
    const userId = 'user-1';

    it('should reject invitation successfully', async () => {
      mockPrismaService.teamInvitation.findUnique.mockResolvedValue({
        id: invitationId,
        inviteeId: userId,
        status: InvitationStatus.PENDING,
      });
      mockPrismaService.teamInvitation.update.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.rejectInvitation(invitationId, userId);

      expect(result.success).toBe(true);
      expect(mockPrismaService.teamInvitation.update).toHaveBeenCalledWith({
        where: { id: invitationId },
        data: { status: InvitationStatus.REJECTED },
      });
    });

    it('should throw NotFoundException if invitation not found', async () => {
      mockPrismaService.teamInvitation.findUnique.mockResolvedValue(null);

      await expect(service.rejectInvitation(invitationId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancelInvitation', () => {
    const invitationId = 'invitation-1';
    const senderId = 'sender-1';

    it('should cancel invitation successfully', async () => {
      mockPrismaService.teamInvitation.findUnique.mockResolvedValue({
        id: invitationId,
        invitedById: senderId,
        status: InvitationStatus.PENDING,
      });
      mockPrismaService.teamInvitation.delete.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.cancelInvitation(invitationId, senderId);

      expect(result.success).toBe(true);
      expect(mockPrismaService.teamInvitation.delete).toHaveBeenCalledWith({
        where: { id: invitationId },
      });
    });

    it('should throw ForbiddenException if not the sender', async () => {
      mockPrismaService.teamInvitation.findUnique.mockResolvedValue({
        id: invitationId,
        invitedById: 'different-sender',
        status: InvitationStatus.PENDING,
      });

      await expect(service.cancelInvitation(invitationId, senderId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getTeamInvitations', () => {
    const teamId = 'team-1';

    it('should get team invitations', async () => {
      const mockInvitations = [
        {
          id: 'invitation-1',
          teamId,
          status: InvitationStatus.PENDING,
          expiresAt: new Date(Date.now() + 86400000),
          invitedBy: { id: 'sender-1', name: 'Sender' },
          invitee: { id: 'invitee-1', name: 'Invitee' },
        },
      ];
      mockPrismaService.teamInvitation.findMany.mockResolvedValue(mockInvitations);

      const result = await service.getTeamInvitations(teamId);

      expect(result).toEqual(mockInvitations);
    });
  });

  describe('getUserInvitations', () => {
    const userId = 'user-1';

    it('should get user invitations', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        email: 'user@test.com',
      });
      const mockInvitations = [
        {
          id: 'invitation-1',
          inviteeId: userId,
          status: InvitationStatus.PENDING,
          expiresAt: new Date(Date.now() + 86400000),
          team: { name: 'Test Team', hackathon: { title: 'Test Hackathon' } },
          invitedBy: { name: 'Sender' },
        },
      ];
      mockPrismaService.teamInvitation.findMany.mockResolvedValue(mockInvitations);

      const result = await service.getUserInvitations(userId);

      expect(result).toEqual(mockInvitations);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserInvitations(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
