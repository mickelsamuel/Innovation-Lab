import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { NotificationsService } from '../notifications/notifications.service';
import { prismaMock, resetPrismaMock } from '../../test/utils/prisma-mock';
import { TestDataFactory } from '../../test/utils/test-data-factory';
import { TeamMemberRole } from '@innovation-lab/database';

describe('TeamsService', () => {
  let service: TeamsService;
  let gamificationService: GamificationService;

  beforeEach(async () => {
    resetPrismaMock();
    TestDataFactory.resetCounters();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: GamificationService,
          useValue: {
            awardXp: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn().mockResolvedValue(undefined),
            createBulk: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    gamificationService = module.get<GamificationService>(GamificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      hackathonId: 'hackathon-1',
      name: 'Team Awesome',
      bio: 'We are awesome',
      logoUrl: 'https://example.com/logo.png',
      repoUrl: 'https://github.com/team/repo',
      demoUrl: 'https://demo.team.com',
    };

    it('should successfully create a team with creator as lead', async () => {
      const hackathon = {
        id: 'hackathon-1',
        maxTeamSize: 5,
        allowSoloTeams: true,
        status: 'ACTIVE',
      };

      const createdTeam = {
        id: 'team-1',
        ...createDto,
        members: [
          {
            userId: 'user-1',
            role: TeamMemberRole.LEAD,
            user: { id: 'user-1', name: 'User 1', handle: 'user1', avatarUrl: null },
          },
        ],
        hackathon: { id: 'hackathon-1', title: 'Test Hackathon', slug: 'test-hack' },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon);
      prismaMock.teamMember.findFirst.mockResolvedValue(null);
      prismaMock.team.create.mockResolvedValue(createdTeam);
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.create(createDto, 'user-1');

      expect(result.id).toBe('team-1');
      expect(result.name).toBe(createDto.name);
      expect(result.members).toHaveLength(1);
      expect(result.members[0].role).toBe(TeamMemberRole.LEAD);

      // Verify XP awards
      expect(gamificationService.awardXp).toHaveBeenCalledTimes(2);
      expect(gamificationService.awardXp).toHaveBeenCalledWith(
        'user-1',
        'JOIN_HACKATHON',
        expect.any(Number),
        'hackathon',
        'hackathon-1'
      );
      expect(gamificationService.awardXp).toHaveBeenCalledWith(
        'user-1',
        'CREATE_TEAM',
        expect.any(Number),
        'team',
        'team-1'
      );

      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if hackathon not found', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto, 'user-1')).rejects.toThrow('Hackathon not found');

      expect(prismaMock.team.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if user already in a team for this hackathon', async () => {
      const hackathon = {
        id: 'hackathon-1',
        maxTeamSize: 5,
        allowSoloTeams: true,
        status: 'ACTIVE',
      };

      const existingTeamMember = {
        userId: 'user-1',
        teamId: 'existing-team',
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon);
      prismaMock.teamMember.findFirst.mockResolvedValue(existingTeamMember);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(ConflictException);
      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        'You are already part of a team in this hackathon'
      );

      expect(prismaMock.team.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all teams for a hackathon', async () => {
      const mockTeams = [
        {
          ...TestDataFactory.createTeam('hackathon-1', 'user-1'),
          members: [],
          _count: { submissions: 2 },
        },
        {
          ...TestDataFactory.createTeam('hackathon-1', 'user-2'),
          members: [],
          _count: { submissions: 1 },
        },
      ];

      prismaMock.team.findMany.mockResolvedValue(mockTeams);

      const result = await service.findAll('hackathon-1');

      expect(result).toHaveLength(2);
      expect(prismaMock.team.findMany).toHaveBeenCalledWith({
        where: { hackathonId: 'hackathon-1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a team by ID with all relations', async () => {
      const mockTeam = {
        ...TestDataFactory.createTeam('hackathon-1', 'user-1'),
        members: [
          {
            user: {
              id: 'user-1',
              name: 'User 1',
              handle: 'user1',
              avatarUrl: null,
              bio: 'Bio 1',
              organization: 'Org 1',
            },
          },
        ],
        hackathon: {
          id: 'hackathon-1',
          title: 'Test Hackathon',
          slug: 'test-hack',
          maxTeamSize: 5,
          status: 'ACTIVE',
        },
        submissions: [],
      };

      prismaMock.team.findUnique.mockResolvedValue(mockTeam);

      const result = await service.findOne('team-1');

      expect(result).toEqual(mockTeam);
      expect(prismaMock.team.findUnique).toHaveBeenCalledWith({
        where: { id: 'team-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if team not found', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow('Team not found');
    });
  });

  describe('findUserTeams', () => {
    it('should return all teams where user is a member', async () => {
      const mockTeamMembers = [
        {
          role: TeamMemberRole.LEAD,
          team: {
            id: 'team-1',
            name: 'Team 1',
            bio: 'Bio 1',
            hackathon: { id: 'hack-1', title: 'Hack 1' },
            _count: { members: 3 },
          },
        },
        {
          role: TeamMemberRole.MEMBER,
          team: {
            id: 'team-2',
            name: 'Team 2',
            bio: 'Bio 2',
            hackathon: { id: 'hack-2', title: 'Hack 2' },
            _count: { members: 5 },
          },
        },
      ];

      prismaMock.teamMember.findMany.mockResolvedValue(mockTeamMembers);

      const result = await service.findUserTeams('user-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('role', TeamMemberRole.LEAD);
      expect(result[1]).toHaveProperty('role', TeamMemberRole.MEMBER);
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Team Name',
      bio: 'Updated bio',
      logoUrl: 'https://example.com/new-logo.png',
      repoUrl: 'https://github.com/updated/repo',
      demoUrl: 'https://updated.demo.com',
    };

    it('should successfully update team when user is team lead', async () => {
      const team = {
        ...TestDataFactory.createTeam('hackathon-1', 'user-1'),
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
        ],
      };

      const updatedTeam = { ...team, ...updateDto };

      prismaMock.team.findUnique.mockResolvedValue(team);
      prismaMock.team.update.mockResolvedValue(updatedTeam);
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.update('team-1', updateDto, 'user-1');

      expect(result.name).toBe(updateDto.name);
      expect(prismaMock.team.update).toHaveBeenCalledWith({
        where: { id: 'team-1' },
        data: expect.objectContaining(updateDto),
        include: expect.any(Object),
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if team not found', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto, 'user-1')).rejects.toThrow(
        NotFoundException
      );

      expect(prismaMock.team.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not team lead', async () => {
      const team = {
        ...TestDataFactory.createTeam('hackathon-1', 'user-1'),
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
        ],
      };

      prismaMock.team.findUnique.mockResolvedValue(team);

      await expect(service.update('team-1', updateDto, 'user-2')).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.update('team-1', updateDto, 'user-2')).rejects.toThrow(
        'Only team lead can update team details'
      );

      expect(prismaMock.team.update).not.toHaveBeenCalled();
    });
  });

  describe('addMember', () => {
    const inviteDto = {
      userId: 'user-3',
      role: TeamMemberRole.MEMBER,
    };

    it('should successfully add member to team', async () => {
      const team = {
        id: 'team-1',
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
        ],
        hackathon: { id: 'hackathon-1', maxTeamSize: 5 },
      };

      const updatedTeam = {
        ...team,
        members: [...team.members, { userId: 'user-3', role: TeamMemberRole.MEMBER }],
      };

      prismaMock.team.findUnique.mockResolvedValueOnce(team).mockResolvedValueOnce(updatedTeam);
      prismaMock.teamMember.findFirst.mockResolvedValue(null);
      prismaMock.teamMember.count.mockResolvedValue(2);
      prismaMock.teamMember.create.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      // Mock transaction to execute the callback
      prismaMock.$transaction.mockImplementation(async (callback: Record<string, unknown>) => {
        return callback(prismaMock);
      });

      await service.addMember('team-1', inviteDto, 'user-1');

      expect(prismaMock.teamMember.count).toHaveBeenCalledWith({
        where: { teamId: 'team-1' },
      });
      expect(prismaMock.teamMember.create).toHaveBeenCalledWith({
        data: {
          teamId: 'team-1',
          userId: 'user-3',
          role: TeamMemberRole.MEMBER,
        },
      });

      // Verify XP awards
      expect(gamificationService.awardXp).toHaveBeenCalledTimes(2);
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if team not found', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null);

      await expect(service.addMember('non-existent', inviteDto, 'user-1')).rejects.toThrow(
        NotFoundException
      );

      expect(prismaMock.teamMember.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if inviter is not team lead', async () => {
      const team = {
        id: 'team-1',
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
        ],
        hackathon: { id: 'hackathon-1', maxTeamSize: 5 },
      };

      prismaMock.team.findUnique.mockResolvedValue(team);

      await expect(service.addMember('team-1', inviteDto, 'user-2')).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.addMember('team-1', inviteDto, 'user-2')).rejects.toThrow(
        'Only team lead can invite members'
      );

      expect(prismaMock.teamMember.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if team is full', async () => {
      const team = {
        id: 'team-1',
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
          { userId: 'user-4', role: TeamMemberRole.MEMBER },
          { userId: 'user-5', role: TeamMemberRole.MEMBER },
          { userId: 'user-6', role: TeamMemberRole.MEMBER },
        ],
        hackathon: { id: 'hackathon-1', maxTeamSize: 5 },
      };

      prismaMock.team.findUnique.mockResolvedValue(team);
      prismaMock.teamMember.findFirst.mockResolvedValue(null);
      prismaMock.teamMember.count.mockResolvedValue(5);

      // Mock transaction to execute the callback
      prismaMock.$transaction.mockImplementation(async (callback: Record<string, unknown>) => {
        return callback(prismaMock);
      });

      await expect(service.addMember('team-1', inviteDto, 'user-1')).rejects.toThrow(
        BadRequestException
      );
      await expect(service.addMember('team-1', inviteDto, 'user-1')).rejects.toThrow(
        'Team is full'
      );

      expect(prismaMock.teamMember.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if user is already a member', async () => {
      const team = {
        id: 'team-1',
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-3', role: TeamMemberRole.MEMBER },
        ],
        hackathon: { id: 'hackathon-1', maxTeamSize: 5 },
      };

      prismaMock.team.findUnique.mockResolvedValue(team);

      await expect(service.addMember('team-1', inviteDto, 'user-1')).rejects.toThrow(
        ConflictException
      );
      await expect(service.addMember('team-1', inviteDto, 'user-1')).rejects.toThrow(
        'User is already a team member'
      );

      expect(prismaMock.teamMember.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if user is in another team for this hackathon', async () => {
      const team = {
        id: 'team-1',
        members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
        hackathon: { id: 'hackathon-1', maxTeamSize: 5 },
      };

      const otherTeamMember = {
        userId: 'user-3',
        teamId: 'other-team',
      };

      prismaMock.team.findUnique.mockResolvedValue(team);
      prismaMock.teamMember.findFirst.mockResolvedValue(otherTeamMember);

      await expect(service.addMember('team-1', inviteDto, 'user-1')).rejects.toThrow(
        ConflictException
      );
      await expect(service.addMember('team-1', inviteDto, 'user-1')).rejects.toThrow(
        'User is already in another team for this hackathon'
      );

      expect(prismaMock.teamMember.create).not.toHaveBeenCalled();
    });
  });

  describe('removeMember', () => {
    it('should successfully remove member when user is team lead', async () => {
      const team = {
        id: 'team-1',
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
        ],
      };

      prismaMock.team.findUnique.mockResolvedValue(team);
      prismaMock.teamMember.delete.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.removeMember('team-1', 'user-2', 'user-1');

      expect(result).toEqual({ success: true, message: 'Member removed successfully' });
      expect(prismaMock.teamMember.delete).toHaveBeenCalledWith({
        where: {
          teamId_userId: {
            teamId: 'team-1',
            userId: 'user-2',
          },
        },
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should allow member to remove themselves', async () => {
      const team = {
        id: 'team-1',
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
        ],
      };

      prismaMock.team.findUnique.mockResolvedValue(team);
      prismaMock.teamMember.delete.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.removeMember('team-1', 'user-2', 'user-2');

      expect(result).toEqual({ success: true, message: 'Member removed successfully' });
    });

    it('should throw NotFoundException if team not found', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null);

      await expect(service.removeMember('non-existent', 'user-2', 'user-1')).rejects.toThrow(
        NotFoundException
      );

      expect(prismaMock.teamMember.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if non-lead tries to remove another member', async () => {
      const team = {
        id: 'team-1',
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
          { userId: 'user-3', role: TeamMemberRole.MEMBER },
        ],
      };

      prismaMock.team.findUnique.mockResolvedValue(team);

      await expect(service.removeMember('team-1', 'user-3', 'user-2')).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.removeMember('team-1', 'user-3', 'user-2')).rejects.toThrow(
        'Only team lead can remove members'
      );

      expect(prismaMock.teamMember.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if non-member tries to remove lead', async () => {
      const team = {
        id: 'team-1',
        members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
      };

      prismaMock.team.findUnique.mockResolvedValue(team);

      await expect(service.removeMember('team-1', 'user-1', 'user-2')).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.removeMember('team-1', 'user-1', 'user-2')).rejects.toThrow(
        'Only team lead can remove members'
      );

      expect(prismaMock.teamMember.delete).not.toHaveBeenCalled();
    });

    it('should promote another member when lead leaves', async () => {
      const team = {
        id: 'team-1',
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
        ],
      };

      prismaMock.team.findUnique.mockResolvedValue(team);
      prismaMock.teamMember.delete.mockResolvedValue({});
      prismaMock.teamMember.update.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      await service.removeMember('team-1', 'user-1', 'user-1');

      expect(prismaMock.teamMember.update).toHaveBeenCalledWith({
        where: {
          teamId_userId: {
            teamId: 'team-1',
            userId: 'user-2',
          },
        },
        data: {
          role: TeamMemberRole.LEAD,
        },
      });
    });

    it('should delete team when last member (lead) leaves', async () => {
      const team = {
        id: 'team-1',
        members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
      };

      prismaMock.team.findUnique.mockResolvedValue(team);
      prismaMock.teamMember.delete.mockResolvedValue({});
      prismaMock.team.delete.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.removeMember('team-1', 'user-1', 'user-1');

      expect(result).toEqual({ success: true, message: 'Team deleted as last member left' });
      expect(prismaMock.team.delete).toHaveBeenCalledWith({
        where: { id: 'team-1' },
      });
    });
  });

  describe('remove', () => {
    it('should successfully delete team when user is lead and no submissions', async () => {
      const team = {
        id: 'team-1',
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
        ],
        _count: { submissions: 0 },
      };

      prismaMock.team.findUnique.mockResolvedValue(team);
      prismaMock.team.delete.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.remove('team-1', 'user-1');

      expect(result).toEqual({ success: true, message: 'Team deleted successfully' });
      expect(prismaMock.team.delete).toHaveBeenCalledWith({
        where: { id: 'team-1' },
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if team not found', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'user-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.team.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not team lead', async () => {
      const team = {
        id: 'team-1',
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
        ],
        _count: { submissions: 0 },
      };

      prismaMock.team.findUnique.mockResolvedValue(team);

      await expect(service.remove('team-1', 'user-2')).rejects.toThrow(ForbiddenException);
      await expect(service.remove('team-1', 'user-2')).rejects.toThrow(
        'Only team lead can delete team'
      );

      expect(prismaMock.team.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if team has submissions', async () => {
      const team = {
        id: 'team-1',
        members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
        _count: { submissions: 2 },
      };

      prismaMock.team.findUnique.mockResolvedValue(team);

      await expect(service.remove('team-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.remove('team-1', 'user-1')).rejects.toThrow(
        'Cannot delete team with existing submissions'
      );

      expect(prismaMock.team.delete).not.toHaveBeenCalled();
    });
  });
});
