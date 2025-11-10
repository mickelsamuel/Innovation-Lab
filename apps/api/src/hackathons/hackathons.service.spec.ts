import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { HackathonsService } from './hackathons.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { prismaMock, resetPrismaMock } from '../../test/utils/prisma-mock';
import { TestDataFactory } from '../../test/utils/test-data-factory';
import { HackathonStatus, HackathonLocation } from '@innovation-lab/database';

describe('HackathonsService', () => {
  let service: HackathonsService;
  let gamificationService: GamificationService;

  beforeEach(async () => {
    resetPrismaMock();
    TestDataFactory.resetCounters();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackathonsService,
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
      ],
    }).compile();

    service = module.get<HackathonsService>(HackathonsService);
    gamificationService = module.get<GamificationService>(GamificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      slug: 'test-hackathon-2024',
      title: 'Test Hackathon 2024',
      description: 'A test hackathon',
      coverImage: 'https://example.com/image.jpg',
      status: HackathonStatus.DRAFT,
      location: HackathonLocation.VIRTUAL,
      startsAt: new Date('2024-06-01').toISOString(),
      endsAt: new Date('2024-06-30').toISOString(),
      prizePool: 10000,
      maxTeamSize: 5,
      allowSoloTeams: true,
      tracks: [
        {
          title: 'AI/ML Track',
          description: 'Build with AI',
          order: 1,
        },
      ],
      criteria: [
        {
          name: 'Innovation',
          description: 'How innovative is the solution',
          maxScore: 10,
          weight: 0.3,
          order: 1,
        },
      ],
    };

    it('should successfully create a hackathon with tracks and criteria', async () => {
      const createdHackathon = {
        id: 'hackathon-1',
        ...createDto,
        tracks: createDto.tracks,
        criteria: createDto.criteria,
        _count: {
          teams: 0,
          submissions: 0,
          mentors: 0,
          judges: 0,
        },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(null);
      prismaMock.hackathon.create.mockResolvedValue(createdHackathon);
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.create(createDto, 'user-1');

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(createDto.title);
      expect(result.slug).toBe(createDto.slug);
      expect(result.tracks).toHaveLength(1);
      expect(result.criteria).toHaveLength(1);

      expect(prismaMock.hackathon.findUnique).toHaveBeenCalledWith({
        where: { slug: createDto.slug },
      });

      expect(prismaMock.hackathon.create).toHaveBeenCalled();
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if slug already exists', async () => {
      const existingHackathon = TestDataFactory.createHackathon({ slug: createDto.slug });
      prismaMock.hackathon.findUnique.mockResolvedValue(existingHackathon);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(ConflictException);
      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        'Hackathon slug already exists'
      );

      expect(prismaMock.hackathon.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if start date is after end date', async () => {
      const invalidDto = {
        ...createDto,
        startsAt: new Date('2024-06-30').toISOString(),
        endsAt: new Date('2024-06-01').toISOString(),
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.create(invalidDto, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.create(invalidDto, 'user-1')).rejects.toThrow(
        'Start date must be before end date'
      );

      expect(prismaMock.hackathon.create).not.toHaveBeenCalled();
    });

    it('should create hackathon without tracks and criteria', async () => {
      const minimalDto = {
        slug: 'minimal-hack',
        title: 'Minimal Hack',
        description: 'Minimal hackathon',
        status: HackathonStatus.DRAFT,
        location: HackathonLocation.VIRTUAL,
        startsAt: new Date('2024-06-01').toISOString(),
        endsAt: new Date('2024-06-30').toISOString(),
        maxTeamSize: 4,
        allowSoloTeams: false,
      };

      const createdHackathon = {
        id: 'hackathon-2',
        ...minimalDto,
        _count: { teams: 0, submissions: 0, mentors: 0, judges: 0 },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(null);
      prismaMock.hackathon.create.mockResolvedValue(createdHackathon);
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.create(minimalDto, 'user-1');

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(minimalDto.title);
    });
  });

  describe('findAll', () => {
    it('should return paginated hackathons with default params', async () => {
      const mockHackathons = [
        TestDataFactory.createHackathon({ title: 'Hackathon 1' }),
        TestDataFactory.createHackathon({ title: 'Hackathon 2' }),
      ];

      prismaMock.hackathon.findMany.mockResolvedValue(mockHackathons);
      prismaMock.hackathon.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(prismaMock.hackathon.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        })
      );
    });

    it('should filter hackathons by status', async () => {
      const activeHackathons = [TestDataFactory.createHackathon({ status: HackathonStatus.LIVE })];

      prismaMock.hackathon.findMany.mockResolvedValue(activeHackathons);
      prismaMock.hackathon.count.mockResolvedValue(1);

      const result = await service.findAll({ status: 'LIVE' });

      expect(result.data).toHaveLength(1);
      expect(prismaMock.hackathon.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'LIVE',
          }),
        })
      );
    });

    it('should filter hackathons by location', async () => {
      prismaMock.hackathon.findMany.mockResolvedValue([]);
      prismaMock.hackathon.count.mockResolvedValue(0);

      await service.findAll({ location: 'VIRTUAL' });

      expect(prismaMock.hackathon.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: 'VIRTUAL',
          }),
        })
      );
    });

    it('should search hackathons by title or description', async () => {
      prismaMock.hackathon.findMany.mockResolvedValue([]);
      prismaMock.hackathon.count.mockResolvedValue(0);

      await service.findAll({ search: 'AI' });

      expect(prismaMock.hackathon.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'AI', mode: 'insensitive' } },
              { description: { contains: 'AI', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should handle pagination correctly', async () => {
      prismaMock.hackathon.findMany.mockResolvedValue([]);
      prismaMock.hackathon.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 2, limit: 5 });

      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 5,
        totalPages: 5,
      });

      expect(prismaMock.hackathon.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a hackathon by ID with all relations', async () => {
      const mockHackathon = {
        ...TestDataFactory.createHackathon(),
        tracks: [],
        criteria: [],
        mentors: [],
        judges: [],
        _count: { teams: 5, submissions: 10 },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(mockHackathon);

      const result = await service.findOne('hackathon-1');

      expect(result).toEqual(mockHackathon);
      expect(prismaMock.hackathon.findUnique).toHaveBeenCalledWith({
        where: { id: 'hackathon-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if hackathon not found', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow('Hackathon not found');
    });
  });

  describe('findBySlug', () => {
    it('should return a hackathon by slug with announcements', async () => {
      const mockHackathon = {
        ...TestDataFactory.createHackathon({ slug: 'test-hack' }),
        tracks: [],
        criteria: [],
        mentors: [],
        judges: [],
        announcements: [],
        _count: { teams: 0, submissions: 0 },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(mockHackathon);

      const result = await service.findBySlug('test-hack');

      expect(result).toEqual(mockHackathon);
      expect(prismaMock.hackathon.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-hack' },
        include: expect.objectContaining({
          announcements: expect.any(Object),
        }),
      });
    });

    it('should throw NotFoundException if hackathon slug not found', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findBySlug('non-existent')).rejects.toThrow('Hackathon not found');
    });
  });

  describe('findUserHackathons', () => {
    it('should return unique hackathons where user has teams', async () => {
      const hackathon1 = TestDataFactory.createHackathon({ title: 'Hack 1' });
      const hackathon2 = TestDataFactory.createHackathon({ title: 'Hack 2' });

      const mockTeamMembers = [
        {
          team: {
            id: 'team-1',
            hackathon: hackathon1,
          },
        },
        {
          team: {
            id: 'team-2',
            hackathon: hackathon2,
          },
        },
      ];

      prismaMock.teamMember.findMany.mockResolvedValue(mockTeamMembers);

      const result = await service.findUserHackathons('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Hack 1');
      expect(result[1].title).toBe('Hack 2');
    });

    it('should remove duplicate hackathons if user is in multiple teams', async () => {
      const hackathon = TestDataFactory.createHackathon({ title: 'Hack 1' });

      const mockTeamMembers = [
        { team: { id: 'team-1', hackathon } },
        { team: { id: 'team-2', hackathon } },
      ];

      prismaMock.teamMember.findMany.mockResolvedValue(mockTeamMembers);

      const result = await service.findUserHackathons('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Hack 1');
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Hackathon',
      description: 'Updated description',
      status: HackathonStatus.LIVE,
    };

    it('should successfully update a hackathon', async () => {
      const existingHackathon = TestDataFactory.createHackathon();
      const updatedHackathon = { ...existingHackathon, ...updateDto };

      prismaMock.hackathon.findUnique.mockResolvedValue(existingHackathon);
      prismaMock.hackathon.update.mockResolvedValue(updatedHackathon);
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.update('hackathon-1', updateDto, 'user-1');

      expect(result.title).toBe(updateDto.title);
      expect(prismaMock.hackathon.update).toHaveBeenCalledWith({
        where: { id: 'hackathon-1' },
        data: expect.objectContaining({
          title: updateDto.title,
          description: updateDto.description,
        }),
        include: expect.any(Object),
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if hackathon not found', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto, 'user-1')).rejects.toThrow(
        NotFoundException
      );

      expect(prismaMock.hackathon.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if new slug is already taken', async () => {
      const existingHackathon = TestDataFactory.createHackathon({ slug: 'old-slug' });
      const slugConflict = TestDataFactory.createHackathon({ slug: 'new-slug' });

      prismaMock.hackathon.findUnique
        .mockResolvedValueOnce(existingHackathon)
        .mockResolvedValueOnce(slugConflict);

      await expect(service.update('hackathon-1', { slug: 'new-slug' }, 'user-1')).rejects.toThrow(
        ConflictException
      );

      expect(prismaMock.hackathon.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully delete hackathon without teams or submissions', async () => {
      const hackathon = {
        ...TestDataFactory.createHackathon(),
        _count: { teams: 0, submissions: 0 },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon);
      prismaMock.hackathon.delete.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.remove('hackathon-1', 'user-1');

      expect(result).toEqual({ success: true, message: 'Hackathon deleted successfully' });
      expect(prismaMock.hackathon.delete).toHaveBeenCalledWith({
        where: { id: 'hackathon-1' },
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if hackathon not found', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'user-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.hackathon.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if hackathon has teams', async () => {
      const hackathon = {
        ...TestDataFactory.createHackathon(),
        _count: { teams: 5, submissions: 0 },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon);

      await expect(service.remove('hackathon-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.remove('hackathon-1', 'user-1')).rejects.toThrow(
        'Cannot delete hackathon with existing teams or submissions'
      );

      expect(prismaMock.hackathon.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if hackathon has submissions', async () => {
      const hackathon = {
        ...TestDataFactory.createHackathon(),
        _count: { teams: 0, submissions: 3 },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon);

      await expect(service.remove('hackathon-1', 'user-1')).rejects.toThrow(BadRequestException);

      expect(prismaMock.hackathon.delete).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return hackathon statistics', async () => {
      const hackathon = {
        ...TestDataFactory.createHackathon({ prizePool: 50000 }),
        _count: {
          teams: 20,
          submissions: 15,
          mentors: 5,
          judges: 8,
          tracks: 3,
        },
      };

      const submissionsByStatus = [
        { status: 'DRAFT', _count: 5 },
        { status: 'FINAL', _count: 10 },
      ];

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon);
      prismaMock.submission.groupBy.mockResolvedValue(submissionsByStatus);
      prismaMock.teamMember.count.mockResolvedValue(75);

      const result = await service.getStats('hackathon-1');

      expect(result).toEqual({
        teams: 20,
        submissions: 15,
        mentors: 5,
        judges: 8,
        tracks: 3,
        participants: 75,
        submissionsByStatus,
        prizePool: 50000,
      });
    });

    it('should throw NotFoundException if hackathon not found', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.getStats('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('announceWinners', () => {
    const winnersDto = {
      winners: [
        { submissionId: 'sub-1', rank: 1 },
        { submissionId: 'sub-2', rank: 2 },
        { submissionId: 'sub-3', rank: 3 },
      ],
    };

    it('should successfully announce winners and award XP', async () => {
      const hackathon = TestDataFactory.createHackathon({ status: HackathonStatus.JUDGING });
      const team = TestDataFactory.createTeam('hackathon-1', 'user-1');
      const submission = {
        id: 'sub-1',
        hackathonId: 'hackathon-1',
        team: {
          ...team,
          members: [
            { userId: 'user-1', role: 'LEAD' },
            { userId: 'user-2', role: 'MEMBER' },
          ],
        },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon);
      prismaMock.submission.findUnique.mockResolvedValue(submission);
      prismaMock.submission.update.mockResolvedValue({});
      prismaMock.hackathon.update.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.announceWinners(
        'hackathon-1',
        { winners: [winnersDto.winners[0]] },
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Winners announced successfully');
      expect(result.results).toHaveLength(1);

      // Verify submission was updated with rank
      expect(prismaMock.submission.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: { rank: 1 },
      });

      // Verify XP was awarded to all team members
      expect(gamificationService.awardXp).toHaveBeenCalledTimes(2);

      // Verify hackathon status updated to CLOSED
      expect(prismaMock.hackathon.update).toHaveBeenCalledWith({
        where: { id: 'hackathon-1' },
        data: { status: HackathonStatus.CLOSED },
      });
    });

    it('should throw NotFoundException if hackathon not found', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.announceWinners('non-existent', winnersDto, 'admin-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException if hackathon not in JUDGING or CLOSED status', async () => {
      const hackathon = TestDataFactory.createHackathon({ status: HackathonStatus.LIVE });

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon);

      await expect(service.announceWinners('hackathon-1', winnersDto, 'admin-1')).rejects.toThrow(
        BadRequestException
      );
      await expect(service.announceWinners('hackathon-1', winnersDto, 'admin-1')).rejects.toThrow(
        'Hackathon must be in JUDGING or COMPLETED status to announce winners'
      );
    });

    it('should throw NotFoundException if submission not found', async () => {
      const hackathon = TestDataFactory.createHackathon({ status: HackathonStatus.JUDGING });

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon);
      prismaMock.submission.findUnique.mockResolvedValue(null);

      await expect(
        service.announceWinners('hackathon-1', { winners: [winnersDto.winners[0]] }, 'admin-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if submission not from this hackathon', async () => {
      const hackathon = TestDataFactory.createHackathon({ status: HackathonStatus.JUDGING });
      const submission = {
        id: 'sub-1',
        hackathonId: 'different-hackathon',
        team: { members: [] },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon);
      prismaMock.submission.findUnique.mockResolvedValue(submission);

      await expect(
        service.announceWinners('hackathon-1', { winners: [winnersDto.winners[0]] }, 'admin-1')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
