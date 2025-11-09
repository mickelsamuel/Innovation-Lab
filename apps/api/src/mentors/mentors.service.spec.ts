import { Test, TestingModule } from '@nestjs/testing';
import { MentorsService } from './mentors.service';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@innovation-lab/database';

describe('MentorsService', () => {
  let service: MentorsService;

  const mockPrismaService = {
    hackathon: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    mentor: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    mentorSession: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MentorsService>(MentorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignMentor', () => {
    const hackathonId = 'hackathon-1';
    const userId = 'user-1';
    const assignerId = 'admin-1';
    const dto = {
      userId,
      bio: 'Expert mentor',
      expertise: ['React', 'Node.js'],
    };

    it('should assign a mentor successfully', async () => {
      const mockHackathon = { id: hackathonId, title: 'Test Hackathon' };
      const mockUser = {
        id: userId,
        roles: [Role.MENTOR],
        name: 'John Doe',
        email: 'john@test.com',
      };
      const mockMentor = {
        id: 'mentor-1',
        userId,
        hackathonId,
        bio: dto.bio,
        expertise: dto.expertise,
        user: mockUser,
      };

      mockPrismaService.hackathon.findUnique.mockResolvedValue(mockHackathon);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.mentor.findUnique.mockResolvedValue(null);
      mockPrismaService.mentor.create.mockResolvedValue(mockMentor);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.assignMentor(hackathonId, dto, assignerId);

      expect(result).toEqual(mockMentor);
      expect(mockPrismaService.mentor.create).toHaveBeenCalledWith({
        data: {
          hackathonId,
          userId,
          bio: dto.bio,
          calendlyUrl: undefined,
          expertise: dto.expertise,
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if hackathon does not exist', async () => {
      mockPrismaService.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.assignMentor(hackathonId, dto, assignerId)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException if user does not have MENTOR role', async () => {
      mockPrismaService.hackathon.findUnique.mockResolvedValue({ id: hackathonId });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        roles: [Role.PARTICIPANT],
      });

      await expect(service.assignMentor(hackathonId, dto, assignerId)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw ConflictException if mentor is already assigned', async () => {
      mockPrismaService.hackathon.findUnique.mockResolvedValue({ id: hackathonId });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        roles: [Role.MENTOR],
      });
      mockPrismaService.mentor.findUnique.mockResolvedValue({ id: 'existing-mentor' });

      await expect(service.assignMentor(hackathonId, dto, assignerId)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('getMentors', () => {
    it('should return mentors for a hackathon', async () => {
      const hackathonId = 'hackathon-1';
      const mockMentors = [
        {
          id: 'mentor-1',
          userId: 'user-1',
          hackathonId,
          user: { name: 'John Doe' },
          sessions: [],
          _count: { sessions: 2 },
        },
      ];

      mockPrismaService.hackathon.findUnique.mockResolvedValue({ id: hackathonId });
      mockPrismaService.mentor.findMany.mockResolvedValue(mockMentors);

      const result = await service.getMentors(hackathonId);

      expect(result).toEqual(mockMentors);
    });

    it('should throw NotFoundException if hackathon does not exist', async () => {
      mockPrismaService.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.getMentors('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeMentor', () => {
    it('should remove a mentor successfully', async () => {
      const hackathonId = 'hackathon-1';
      const userId = 'user-1';
      const removerId = 'admin-1';
      const mockMentor = {
        id: 'mentor-1',
        userId,
        hackathonId,
        sessions: [],
      };

      mockPrismaService.mentor.findUnique.mockResolvedValue(mockMentor);
      mockPrismaService.mentor.delete.mockResolvedValue(mockMentor);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.removeMentor(hackathonId, userId, removerId);

      expect(result).toEqual({
        success: true,
        message: 'Mentor removed successfully',
      });
    });

    it('should throw BadRequestException if mentor has upcoming sessions', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      const mockMentor = {
        id: 'mentor-1',
        sessions: [{ startsAt: futureDate }],
      };

      mockPrismaService.mentor.findUnique.mockResolvedValue(mockMentor);

      await expect(service.removeMentor('hackathon-1', 'user-1', 'admin-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('createSession', () => {
    const mentorId = 'mentor-1';
    const actorId = 'user-1';
    const dto = {
      title: 'Office Hours',
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      endsAt: new Date(Date.now() + 90000000).toISOString(),
      capacity: 10,
    };

    it('should create a session successfully', async () => {
      const mockMentor = {
        id: mentorId,
        userId: actorId,
        hackathon: { id: 'hackathon-1' },
      };
      const mockUser = {
        id: actorId,
        roles: [Role.MENTOR],
      };
      const mockSession = {
        id: 'session-1',
        ...dto,
        mentorId,
        booked: 0,
      };

      mockPrismaService.mentor.findUnique.mockResolvedValue(mockMentor);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.mentorSession.findMany.mockResolvedValue([]);
      mockPrismaService.mentorSession.create.mockResolvedValue(mockSession);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.createSession(mentorId, dto, actorId);

      expect(result).toBeDefined();
      expect(mockPrismaService.mentorSession.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if start time is after end time', async () => {
      const invalidDto = {
        ...dto,
        startsAt: new Date(Date.now() + 90000000).toISOString(),
        endsAt: new Date(Date.now() + 86400000).toISOString(),
      };

      mockPrismaService.mentor.findUnique.mockResolvedValue({
        id: mentorId,
        userId: actorId,
      });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: actorId, roles: [Role.MENTOR] });

      await expect(service.createSession(mentorId, invalidDto, actorId)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw ConflictException if session conflicts with existing session', async () => {
      mockPrismaService.mentor.findUnique.mockResolvedValue({
        id: mentorId,
        userId: actorId,
      });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: actorId, roles: [Role.MENTOR] });
      mockPrismaService.mentorSession.findMany.mockResolvedValue([{ id: 'existing-session' }]);

      await expect(service.createSession(mentorId, dto, actorId)).rejects.toThrow(
        ConflictException
      );
    });

    it('should throw ForbiddenException if actor is not the mentor or admin', async () => {
      mockPrismaService.mentor.findUnique.mockResolvedValue({
        id: mentorId,
        userId: 'different-user',
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: actorId,
        roles: [Role.PARTICIPANT],
      });

      await expect(service.createSession(mentorId, dto, actorId)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete a session successfully', async () => {
      const sessionId = 'session-1';
      const actorId = 'user-1';
      const futureDate = new Date(Date.now() + 86400000);

      mockPrismaService.mentorSession.findUnique.mockResolvedValue({
        id: sessionId,
        startsAt: futureDate,
        endsAt: new Date(futureDate.getTime() + 3600000),
        mentor: { userId: actorId },
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: actorId,
        roles: [Role.MENTOR],
      });
      mockPrismaService.mentorSession.delete.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.deleteSession(sessionId, actorId);

      expect(result).toEqual({
        success: true,
        message: 'Session deleted successfully',
      });
    });

    it('should throw BadRequestException if session is in progress', async () => {
      const sessionId = 'session-1';
      const now = new Date();

      mockPrismaService.mentorSession.findUnique.mockResolvedValue({
        id: sessionId,
        startsAt: new Date(now.getTime() - 1800000),
        endsAt: new Date(now.getTime() + 1800000),
        mentor: { userId: 'user-1' },
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        roles: [Role.MENTOR],
      });

      await expect(service.deleteSession(sessionId, 'user-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
