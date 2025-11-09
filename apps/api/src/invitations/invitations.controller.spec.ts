import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { TeamMemberRole, InvitationStatus } from '@innovation-lab/database';

describe('InvitationsController', () => {
  let controller: InvitationsController;
  let service: InvitationsService;

  const mockInvitationsService = {
    sendInvitation: jest.fn(),
    getTeamInvitations: jest.fn(),
    getUserInvitations: jest.fn(),
    acceptInvitation: jest.fn(),
    rejectInvitation: jest.fn(),
    cancelInvitation: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    roles: ['PARTICIPANT'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationsController],
      providers: [
        {
          provide: InvitationsService,
          useValue: mockInvitationsService,
        },
      ],
    }).compile();

    controller = module.get<InvitationsController>(InvitationsController);
    service = module.get<InvitationsService>(InvitationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendInvitation', () => {
    it('should send invitation', async () => {
      const teamId = 'team-1';
      const dto = {
        inviteeId: 'invitee-1',
        role: TeamMemberRole.MEMBER,
      };
      const mockInvitation = {
        id: 'invitation-1',
        teamId,
        inviteeId: dto.inviteeId,
        role: dto.role,
        status: InvitationStatus.PENDING,
      };

      mockInvitationsService.sendInvitation.mockResolvedValue(mockInvitation);

      const result = await controller.sendInvitation(teamId, dto, mockUser);

      expect(result).toEqual(mockInvitation);
      expect(service.sendInvitation).toHaveBeenCalledWith(teamId, dto, mockUser.id);
    });
  });

  describe('getTeamInvitations', () => {
    it('should get team invitations', async () => {
      const teamId = 'team-1';
      const mockInvitations = [
        {
          id: 'invitation-1',
          teamId,
          status: InvitationStatus.PENDING,
        },
      ];

      mockInvitationsService.getTeamInvitations.mockResolvedValue(mockInvitations);

      const result = await controller.getTeamInvitations(teamId);

      expect(result).toEqual(mockInvitations);
      expect(service.getTeamInvitations).toHaveBeenCalledWith(teamId);
    });
  });

  describe('getUserInvitations', () => {
    it('should get user invitations', async () => {
      const mockInvitations = [
        {
          id: 'invitation-1',
          status: InvitationStatus.PENDING,
        },
      ];

      mockInvitationsService.getUserInvitations.mockResolvedValue(mockInvitations);

      const result = await controller.getUserInvitations(mockUser);

      expect(result).toEqual(mockInvitations);
      expect(service.getUserInvitations).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation', async () => {
      const invitationId = 'invitation-1';
      const mockResult = {
        success: true,
        message: 'Invitation accepted',
      };

      mockInvitationsService.acceptInvitation.mockResolvedValue(mockResult);

      const result = await controller.acceptInvitation(invitationId, mockUser);

      expect(result).toEqual(mockResult);
      expect(service.acceptInvitation).toHaveBeenCalledWith(invitationId, mockUser.id);
    });
  });

  describe('rejectInvitation', () => {
    it('should reject invitation', async () => {
      const invitationId = 'invitation-1';
      const mockResult = {
        success: true,
        message: 'Invitation rejected',
      };

      mockInvitationsService.rejectInvitation.mockResolvedValue(mockResult);

      const result = await controller.rejectInvitation(invitationId, mockUser);

      expect(result).toEqual(mockResult);
      expect(service.rejectInvitation).toHaveBeenCalledWith(invitationId, mockUser.id);
    });
  });

  describe('cancelInvitation', () => {
    it('should cancel invitation', async () => {
      const invitationId = 'invitation-1';
      const mockResult = {
        success: true,
        message: 'Invitation cancelled',
      };

      mockInvitationsService.cancelInvitation.mockResolvedValue(mockResult);

      const result = await controller.cancelInvitation(invitationId, mockUser);

      expect(result).toEqual(mockResult);
      expect(service.cancelInvitation).toHaveBeenCalledWith(invitationId, mockUser.id);
    });
  });
});
