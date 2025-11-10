import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { WebSocketService } from '../websocket/websocket.service';
import { prismaMock, resetPrismaMock } from '../../test/utils/prisma-mock';
import { TestDataFactory } from '../../test/utils/test-data-factory';
import { SubmissionStatus, TeamMemberRole } from '@innovation-lab/database';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let gamificationService: GamificationService;

  beforeEach(async () => {
    resetPrismaMock();
    TestDataFactory.resetCounters();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
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
          provide: WebSocketService,
          useValue: {
            emitToRoom: jest.fn(),
            emitToUser: jest.fn(),
            emitNewSubmission: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
    gamificationService = module.get<GamificationService>(GamificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      hackathonId: 'hackathon-1',
      teamId: 'team-1',
      trackId: 'track-1',
      title: 'Awesome Project',
      abstract: 'This is an awesome project',
      repoUrl: 'https://github.com/team/project',
      demoUrl: 'https://demo.project.com',
      videoUrl: 'https://youtube.com/watch?v=xxx',
      files: ['file1.pdf', 'file2.pdf'],
    };

    it('should successfully create a submission', async () => {
      const team = {
        id: 'team-1',
        members: [
          { userId: 'user-1', role: TeamMemberRole.LEAD },
          { userId: 'user-2', role: TeamMemberRole.MEMBER },
        ],
        hackathon: {
          id: 'hackathon-1',
          status: 'ACTIVE',
          endsAt: new Date('2025-12-31'),
        },
      };

      const createdSubmission = {
        id: 'submission-1',
        ...createDto,
        status: SubmissionStatus.DRAFT,
        team: {
          ...team,
          members: team.members.map(m => ({
            ...m,
            user: {
              id: m.userId,
              name: `User ${m.userId}`,
              handle: `user${m.userId}`,
              avatarUrl: null,
            },
          })),
        },
        track: { id: 'track-1', title: 'AI Track' },
      };

      prismaMock.team.findUnique.mockResolvedValue(team);
      prismaMock.submission.findFirst.mockResolvedValue(null);
      prismaMock.submission.create.mockResolvedValue(createdSubmission);
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.create(createDto, 'user-1');

      expect(result.id).toBe('submission-1');
      expect(result.title).toBe(createDto.title);
      expect(result.status).toBe(SubmissionStatus.DRAFT);

      // Verify XP awarded to all team members
      expect(gamificationService.awardXp).toHaveBeenCalledTimes(2);
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if team not found', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto, 'user-1')).rejects.toThrow('Team not found');

      expect(prismaMock.submission.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not a team member', async () => {
      const team = {
        id: 'team-1',
        members: [{ userId: 'user-2', role: TeamMemberRole.LEAD }],
        hackathon: {
          id: 'hackathon-1',
          status: 'ACTIVE',
          endsAt: new Date('2025-12-31'),
        },
      };

      prismaMock.team.findUnique.mockResolvedValue(team);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(ForbiddenException);
      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        'You are not a member of this team'
      );

      expect(prismaMock.submission.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if hackathon is closed', async () => {
      const team = {
        id: 'team-1',
        members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
        hackathon: {
          id: 'hackathon-1',
          status: 'CLOSED',
          endsAt: new Date('2025-12-31'),
        },
      };

      prismaMock.team.findUnique.mockResolvedValue(team);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        'Hackathon is not accepting submissions'
      );

      expect(prismaMock.submission.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if submission deadline has passed', async () => {
      const team = {
        id: 'team-1',
        members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
        hackathon: {
          id: 'hackathon-1',
          status: 'ACTIVE',
          endsAt: new Date('2020-01-01'),
        },
      };

      prismaMock.team.findUnique.mockResolvedValue(team);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        'Submission deadline has passed'
      );

      expect(prismaMock.submission.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if team already has a submission', async () => {
      const team = {
        id: 'team-1',
        members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
        hackathon: {
          id: 'hackathon-1',
          status: 'ACTIVE',
          endsAt: new Date('2025-12-31'),
        },
      };

      const existingSubmission = {
        id: 'existing-submission',
        hackathonId: 'hackathon-1',
        teamId: 'team-1',
      };

      prismaMock.team.findUnique.mockResolvedValue(team);
      prismaMock.submission.findFirst.mockResolvedValue(existingSubmission);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        'Team already has a submission for this hackathon'
      );

      expect(prismaMock.submission.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all submissions for a hackathon', async () => {
      const mockSubmissions = [
        {
          id: 'sub-1',
          title: 'Project 1',
          team: { members: [] },
          track: { id: 'track-1', title: 'AI' },
          _count: { scores: 3 },
        },
        {
          id: 'sub-2',
          title: 'Project 2',
          team: { members: [] },
          track: { id: 'track-2', title: 'Web3' },
          _count: { scores: 5 },
        },
      ];

      prismaMock.submission.findMany.mockResolvedValue(mockSubmissions);

      const result = await service.findAll('hackathon-1');

      expect(result).toHaveLength(2);
      expect(prismaMock.submission.findMany).toHaveBeenCalledWith({
        where: { hackathonId: 'hackathon-1' },
        include: expect.any(Object),
        orderBy: expect.any(Array),
      });
    });

    it('should filter submissions by status', async () => {
      prismaMock.submission.findMany.mockResolvedValue([]);

      await service.findAll('hackathon-1', SubmissionStatus.FINAL);

      expect(prismaMock.submission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            hackathonId: 'hackathon-1',
            status: SubmissionStatus.FINAL,
          },
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a submission by ID with all relations', async () => {
      const mockSubmission = {
        id: 'submission-1',
        title: 'Awesome Project',
        team: { members: [{ user: { id: 'user-1', name: 'User 1' } }] },
        track: { id: 'track-1', title: 'AI' },
        hackathon: { id: 'hack-1', title: 'Hackathon 1', slug: 'hack-1', status: 'ACTIVE' },
        scores: [],
      };

      prismaMock.submission.findUnique.mockResolvedValue(mockSubmission);

      const result = await service.findOne('submission-1');

      expect(result).toEqual(mockSubmission);
      expect(prismaMock.submission.findUnique).toHaveBeenCalledWith({
        where: { id: 'submission-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if submission not found', async () => {
      prismaMock.submission.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow('Submission not found');
    });
  });

  describe('findUserSubmissions', () => {
    it('should return all submissions where user is a team member', async () => {
      const mockTeamMembers = [{ teamId: 'team-1' }, { teamId: 'team-2' }];

      const mockSubmissions = [
        {
          id: 'sub-1',
          teamId: 'team-1',
          hackathon: { id: 'hack-1', title: 'Hack 1' },
        },
        {
          id: 'sub-2',
          teamId: 'team-2',
          hackathon: { id: 'hack-2', title: 'Hack 2' },
        },
      ];

      prismaMock.teamMember.findMany.mockResolvedValue(mockTeamMembers);
      prismaMock.submission.findMany.mockResolvedValue(mockSubmissions);

      const result = await service.findUserSubmissions('user-1');

      expect(result).toHaveLength(2);
      expect(prismaMock.submission.findMany).toHaveBeenCalledWith({
        where: {
          teamId: { in: ['team-1', 'team-2'] },
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array if user has no teams', async () => {
      prismaMock.teamMember.findMany.mockResolvedValue([]);

      const result = await service.findUserSubmissions('user-1');

      expect(result).toEqual([]);
      expect(prismaMock.submission.findMany).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Project',
      abstract: 'Updated abstract',
      repoUrl: 'https://github.com/updated/repo',
      demoUrl: 'https://updated-demo.com',
      videoUrl: 'https://youtube.com/updated',
      files: ['updated-file.pdf'],
      trackId: 'track-2',
    };

    it('should successfully update submission when user is team member', async () => {
      const submission = {
        id: 'submission-1',
        status: SubmissionStatus.DRAFT,
        team: {
          members: [
            { userId: 'user-1', role: TeamMemberRole.LEAD },
            { userId: 'user-2', role: TeamMemberRole.MEMBER },
          ],
        },
        hackathon: {
          endsAt: new Date('2025-12-31'),
          status: 'ACTIVE',
        },
      };

      const updatedSubmission = { ...submission, ...updateDto };

      prismaMock.submission.findUnique.mockResolvedValue(submission);
      prismaMock.submission.update.mockResolvedValue(updatedSubmission);
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.update('submission-1', updateDto, 'user-1');

      expect(result.title).toBe(updateDto.title);
      expect(prismaMock.submission.update).toHaveBeenCalledWith({
        where: { id: 'submission-1' },
        data: expect.objectContaining(updateDto),
        include: expect.any(Object),
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if submission not found', async () => {
      prismaMock.submission.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto, 'user-1')).rejects.toThrow(
        NotFoundException
      );

      expect(prismaMock.submission.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not a team member', async () => {
      const submission = {
        id: 'submission-1',
        status: SubmissionStatus.DRAFT,
        team: {
          members: [{ userId: 'user-2', role: TeamMemberRole.LEAD }],
        },
        hackathon: {
          endsAt: new Date('2025-12-31'),
          status: 'ACTIVE',
        },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission);

      await expect(service.update('submission-1', updateDto, 'user-1')).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.update('submission-1', updateDto, 'user-1')).rejects.toThrow(
        'Only team members can update submission'
      );

      expect(prismaMock.submission.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if submission is finalized', async () => {
      const submission = {
        id: 'submission-1',
        status: SubmissionStatus.FINAL,
        team: {
          members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
        },
        hackathon: {
          endsAt: new Date('2025-12-31'),
          status: 'ACTIVE',
        },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission);

      await expect(service.update('submission-1', updateDto, 'user-1')).rejects.toThrow(
        BadRequestException
      );
      await expect(service.update('submission-1', updateDto, 'user-1')).rejects.toThrow(
        'Cannot update finalized submission'
      );

      expect(prismaMock.submission.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if deadline has passed', async () => {
      const submission = {
        id: 'submission-1',
        status: SubmissionStatus.DRAFT,
        team: {
          members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
        },
        hackathon: {
          endsAt: new Date('2020-01-01'),
          status: 'ACTIVE',
        },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission);

      await expect(service.update('submission-1', updateDto, 'user-1')).rejects.toThrow(
        BadRequestException
      );
      await expect(service.update('submission-1', updateDto, 'user-1')).rejects.toThrow(
        'Cannot update submission after deadline'
      );

      expect(prismaMock.submission.update).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should successfully finalize submission when user is team lead', async () => {
      const submission = {
        id: 'submission-1',
        status: SubmissionStatus.DRAFT,
        team: {
          members: [
            { userId: 'user-1', role: TeamMemberRole.LEAD },
            { userId: 'user-2', role: TeamMemberRole.MEMBER },
          ],
        },
        hackathon: {
          endsAt: new Date('2025-12-31'),
        },
      };

      const finalizedSubmission = {
        ...submission,
        status: SubmissionStatus.FINAL,
        submittedAt: new Date(),
        finalizedAt: new Date(),
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission);
      prismaMock.submission.update.mockResolvedValue(finalizedSubmission);
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.submit('submission-1', 'user-1');

      expect(result.status).toBe(SubmissionStatus.FINAL);
      expect(prismaMock.submission.update).toHaveBeenCalledWith({
        where: { id: 'submission-1' },
        data: {
          status: SubmissionStatus.FINAL,
          submittedAt: expect.any(Date),
          finalizedAt: expect.any(Date),
        },
      });

      // Verify XP awarded to all team members
      expect(gamificationService.awardXp).toHaveBeenCalledTimes(2);
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if submission not found', async () => {
      prismaMock.submission.findUnique.mockResolvedValue(null);

      await expect(service.submit('non-existent', 'user-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.submission.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not team lead', async () => {
      const submission = {
        id: 'submission-1',
        status: SubmissionStatus.DRAFT,
        team: {
          members: [
            { userId: 'user-1', role: TeamMemberRole.LEAD },
            { userId: 'user-2', role: TeamMemberRole.MEMBER },
          ],
        },
        hackathon: {
          endsAt: new Date('2025-12-31'),
        },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission);

      await expect(service.submit('submission-1', 'user-2')).rejects.toThrow(ForbiddenException);
      await expect(service.submit('submission-1', 'user-2')).rejects.toThrow(
        'Only team lead can finalize submission'
      );

      expect(prismaMock.submission.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if already finalized', async () => {
      const submission = {
        id: 'submission-1',
        status: SubmissionStatus.FINAL,
        team: {
          members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
        },
        hackathon: {
          endsAt: new Date('2025-12-31'),
        },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission);

      await expect(service.submit('submission-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.submit('submission-1', 'user-1')).rejects.toThrow(
        'Submission already finalized'
      );

      expect(prismaMock.submission.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if deadline has passed', async () => {
      const submission = {
        id: 'submission-1',
        status: SubmissionStatus.DRAFT,
        team: {
          members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
        },
        hackathon: {
          endsAt: new Date('2020-01-01'),
        },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission);

      await expect(service.submit('submission-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.submit('submission-1', 'user-1')).rejects.toThrow(
        'Submission deadline has passed'
      );

      expect(prismaMock.submission.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully delete submission when user is team lead and no scores', async () => {
      const submission = {
        id: 'submission-1',
        team: {
          members: [
            { userId: 'user-1', role: TeamMemberRole.LEAD },
            { userId: 'user-2', role: TeamMemberRole.MEMBER },
          ],
        },
        _count: { scores: 0 },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission);
      prismaMock.submission.delete.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await service.remove('submission-1', 'user-1');

      expect(result).toEqual({ success: true, message: 'Submission deleted successfully' });
      expect(prismaMock.submission.delete).toHaveBeenCalledWith({
        where: { id: 'submission-1' },
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if submission not found', async () => {
      prismaMock.submission.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'user-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.submission.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not team lead', async () => {
      const submission = {
        id: 'submission-1',
        team: {
          members: [
            { userId: 'user-1', role: TeamMemberRole.LEAD },
            { userId: 'user-2', role: TeamMemberRole.MEMBER },
          ],
        },
        _count: { scores: 0 },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission);

      await expect(service.remove('submission-1', 'user-2')).rejects.toThrow(ForbiddenException);
      await expect(service.remove('submission-1', 'user-2')).rejects.toThrow(
        'Only team lead can delete submission'
      );

      expect(prismaMock.submission.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if submission has been scored', async () => {
      const submission = {
        id: 'submission-1',
        team: {
          members: [{ userId: 'user-1', role: TeamMemberRole.LEAD }],
        },
        _count: { scores: 3 },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission);

      await expect(service.remove('submission-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.remove('submission-1', 'user-1')).rejects.toThrow(
        'Cannot delete submission that has been scored'
      );

      expect(prismaMock.submission.delete).not.toHaveBeenCalled();
    });
  });
});
