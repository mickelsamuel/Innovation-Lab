import { Test, TestingModule } from '@nestjs/testing';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';
import { Role } from '@innovation-lab/database';

describe('MentorsController', () => {
  let controller: MentorsController;
  let service: MentorsService;

  const mockMentorsService = {
    assignMentor: jest.fn(),
    getMentors: jest.fn(),
    removeMentor: jest.fn(),
    updateMentor: jest.fn(),
    getMentorAssignments: jest.fn(),
    createSession: jest.fn(),
    getMentorSessions: jest.fn(),
    deleteSession: jest.fn(),
    getHackathonSessions: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    roles: [Role.BANK_ADMIN],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorsController],
      providers: [
        {
          provide: MentorsService,
          useValue: mockMentorsService,
        },
      ],
    }).compile();

    controller = module.get<MentorsController>(MentorsController);
    service = module.get<MentorsService>(MentorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('assignMentor', () => {
    it('should assign a mentor', async () => {
      const hackathonId = 'hackathon-1';
      const dto = {
        userId: 'mentor-1',
        bio: 'Expert mentor',
        expertise: ['React'],
      };
      const expected = { id: 'mentor-1', ...dto };

      mockMentorsService.assignMentor.mockResolvedValue(expected);

      const result = await controller.assignMentor(hackathonId, dto, mockUser);

      expect(result).toEqual(expected);
      expect(service.assignMentor).toHaveBeenCalledWith(hackathonId, dto, mockUser.id);
    });
  });

  describe('getMentors', () => {
    it('should return mentors for a hackathon', async () => {
      const hackathonId = 'hackathon-1';
      const expected = [{ id: 'mentor-1', userId: 'user-1' }];

      mockMentorsService.getMentors.mockResolvedValue(expected);

      const result = await controller.getMentors(hackathonId);

      expect(result).toEqual(expected);
      expect(service.getMentors).toHaveBeenCalledWith(hackathonId);
    });
  });

  describe('removeMentor', () => {
    it('should remove a mentor', async () => {
      const hackathonId = 'hackathon-1';
      const userId = 'user-1';
      const expected = { success: true, message: 'Mentor removed successfully' };

      mockMentorsService.removeMentor.mockResolvedValue(expected);

      const result = await controller.removeMentor(hackathonId, userId, mockUser);

      expect(result).toEqual(expected);
      expect(service.removeMentor).toHaveBeenCalledWith(hackathonId, userId, mockUser.id);
    });
  });

  describe('updateMentor', () => {
    it('should update a mentor', async () => {
      const hackathonId = 'hackathon-1';
      const userId = 'user-1';
      const dto = { bio: 'Updated bio' };
      const expected = { id: 'mentor-1', ...dto };

      mockMentorsService.updateMentor.mockResolvedValue(expected);

      const result = await controller.updateMentor(hackathonId, userId, dto, mockUser);

      expect(result).toEqual(expected);
      expect(service.updateMentor).toHaveBeenCalledWith(hackathonId, userId, dto, mockUser.id);
    });
  });

  describe('getMyAssignments', () => {
    it('should return mentor assignments', async () => {
      const expected = [{ id: 'mentor-1', hackathonId: 'hackathon-1' }];

      mockMentorsService.getMentorAssignments.mockResolvedValue(expected);

      const result = await controller.getMyAssignments(mockUser);

      expect(result).toEqual(expected);
      expect(service.getMentorAssignments).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('createSession', () => {
    it('should create a mentor session', async () => {
      const mentorId = 'mentor-1';
      const dto = {
        title: 'Office Hours',
        startsAt: new Date().toISOString(),
        endsAt: new Date().toISOString(),
      };
      const expected = { id: 'session-1', ...dto };

      mockMentorsService.createSession.mockResolvedValue(expected);

      const result = await controller.createSession(mentorId, dto, mockUser);

      expect(result).toEqual(expected);
      expect(service.createSession).toHaveBeenCalledWith(mentorId, dto, mockUser.id);
    });
  });

  describe('getMentorSessions', () => {
    it('should return mentor sessions', async () => {
      const mentorId = 'mentor-1';
      const expected = [{ id: 'session-1' }];

      mockMentorsService.getMentorSessions.mockResolvedValue(expected);

      const result = await controller.getMentorSessions(mentorId);

      expect(result).toEqual(expected);
      expect(service.getMentorSessions).toHaveBeenCalledWith(mentorId, false);
    });

    it('should include all sessions when includeAll is true', async () => {
      const mentorId = 'mentor-1';
      const expected = [{ id: 'session-1' }];

      mockMentorsService.getMentorSessions.mockResolvedValue(expected);

      const result = await controller.getMentorSessions(mentorId, 'true');

      expect(result).toEqual(expected);
      expect(service.getMentorSessions).toHaveBeenCalledWith(mentorId, true);
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      const sessionId = 'session-1';
      const expected = { success: true, message: 'Session deleted successfully' };

      mockMentorsService.deleteSession.mockResolvedValue(expected);

      const result = await controller.deleteSession(sessionId, mockUser);

      expect(result).toEqual(expected);
      expect(service.deleteSession).toHaveBeenCalledWith(sessionId, mockUser.id);
    });
  });

  describe('getHackathonSessions', () => {
    it('should return hackathon sessions', async () => {
      const hackathonId = 'hackathon-1';
      const expected = [{ id: 'session-1' }];

      mockMentorsService.getHackathonSessions.mockResolvedValue(expected);

      const result = await controller.getHackathonSessions(hackathonId);

      expect(result).toEqual(expected);
      expect(service.getHackathonSessions).toHaveBeenCalledWith(hackathonId);
    });
  });
});
