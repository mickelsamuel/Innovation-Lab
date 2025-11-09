import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JudgingService } from './judging.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { WebSocketService } from '../websocket/websocket.service';
import { prismaMock, resetPrismaMock } from '../../test/utils/prisma-mock';
import { TestDataFactory } from '../../test/utils/test-data-factory';
import { Role } from '@innovation-lab/database';

describe('JudgingService', () => {
  let service: JudgingService;
  let gamificationService: GamificationService;

  beforeEach(async () => {
    resetPrismaMock();
    TestDataFactory.resetCounters();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JudgingService,
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
            emitSubmissionScored: jest.fn(),
            emitLeaderboardUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JudgingService>(JudgingService);
    gamificationService = module.get<GamificationService>(GamificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assignJudge', () => {
    const assignDto = {
      userId: 'judge-1',
    };

    it('should successfully assign a judge to hackathon', async () => {
      const hackathon = { id: 'hackathon-1', title: 'Test Hack' };
      const user = { id: 'judge-1', roles: [Role.JUDGE] };
      const judge = {
        id: 'assignment-1',
        hackathonId: 'hackathon-1',
        userId: 'judge-1',
        user: { id: 'judge-1', name: 'Judge User', handle: 'judge', email: 'judge@test.com', avatarUrl: null },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon as any);
      prismaMock.user.findUnique.mockResolvedValue(user as any);
      prismaMock.judge.findUnique.mockResolvedValue(null);
      prismaMock.judge.create.mockResolvedValue(judge as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.assignJudge('hackathon-1', assignDto, 'admin-1');

      expect(result).toEqual(judge);
      expect(prismaMock.judge.create).toHaveBeenCalledWith({
        data: {
          hackathonId: 'hackathon-1',
          userId: 'judge-1',
        },
        include: expect.any(Object),
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if hackathon not found', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.assignJudge('non-existent', assignDto, 'admin-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.judge.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const hackathon = { id: 'hackathon-1', title: 'Test Hack' };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon as any);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.assignJudge('hackathon-1', assignDto, 'admin-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.judge.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user does not have JUDGE or BANK_ADMIN role', async () => {
      const hackathon = { id: 'hackathon-1', title: 'Test Hack' };
      const user = { id: 'judge-1', roles: [Role.PARTICIPANT] };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon as any);
      prismaMock.user.findUnique.mockResolvedValue(user as any);

      await expect(service.assignJudge('hackathon-1', assignDto, 'admin-1')).rejects.toThrow(BadRequestException);
      await expect(service.assignJudge('hackathon-1', assignDto, 'admin-1')).rejects.toThrow('User must have JUDGE or BANK_ADMIN role');

      expect(prismaMock.judge.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if judge already assigned', async () => {
      const hackathon = { id: 'hackathon-1', title: 'Test Hack' };
      const user = { id: 'judge-1', roles: [Role.JUDGE] };
      const existingJudge = { id: 'assignment-1', hackathonId: 'hackathon-1', userId: 'judge-1' };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon as any);
      prismaMock.user.findUnique.mockResolvedValue(user as any);
      prismaMock.judge.findUnique.mockResolvedValue(existingJudge as any);

      await expect(service.assignJudge('hackathon-1', assignDto, 'admin-1')).rejects.toThrow(ConflictException);

      expect(prismaMock.judge.create).not.toHaveBeenCalled();
    });

    it('should accept user with BANK_ADMIN role', async () => {
      const hackathon = { id: 'hackathon-1', title: 'Test Hack' };
      const user = { id: 'admin-1', roles: [Role.BANK_ADMIN] };
      const judge = {
        id: 'assignment-1',
        hackathonId: 'hackathon-1',
        userId: 'admin-1',
        user: { id: 'admin-1', name: 'Admin', handle: 'admin', email: 'admin@test.com', avatarUrl: null },
      };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon as any);
      prismaMock.user.findUnique.mockResolvedValue(user as any);
      prismaMock.judge.findUnique.mockResolvedValue(null);
      prismaMock.judge.create.mockResolvedValue(judge as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.assignJudge('hackathon-1', { userId: 'admin-1' }, 'admin-2');

      expect(result).toEqual(judge);
    });
  });

  describe('getJudges', () => {
    it('should return all judges for a hackathon', async () => {
      const hackathon = { id: 'hackathon-1', title: 'Test Hack' };
      const judges = [
        {
          id: 'judge-1',
          user: { id: 'user-1', name: 'Judge 1', handle: 'judge1', email: 'j1@test.com', avatarUrl: null },
          _count: { scores: 5 },
        },
        {
          id: 'judge-2',
          user: { id: 'user-2', name: 'Judge 2', handle: 'judge2', email: 'j2@test.com', avatarUrl: null },
          _count: { scores: 3 },
        },
      ];

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon as any);
      prismaMock.judge.findMany.mockResolvedValue(judges as any);

      const result = await service.getJudges('hackathon-1');

      expect(result).toEqual(judges);
      expect(prismaMock.judge.findMany).toHaveBeenCalledWith({
        where: { hackathonId: 'hackathon-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if hackathon not found', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.getJudges('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeJudge', () => {
    it('should successfully remove judge without scores', async () => {
      const judge = { id: 'judge-assignment-1', hackathonId: 'hackathon-1', userId: 'judge-1' };

      prismaMock.judge.findUnique.mockResolvedValue(judge as any);
      prismaMock.score.count.mockResolvedValue(0);
      prismaMock.judge.delete.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.removeJudge('hackathon-1', 'judge-1', 'admin-1');

      expect(result).toEqual({ success: true, message: 'Judge removed successfully' });
      expect(prismaMock.judge.delete).toHaveBeenCalledWith({
        where: { id: 'judge-assignment-1' },
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if judge assignment not found', async () => {
      prismaMock.judge.findUnique.mockResolvedValue(null);

      await expect(service.removeJudge('hackathon-1', 'judge-1', 'admin-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.judge.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if judge has scored submissions', async () => {
      const judge = { id: 'judge-assignment-1', hackathonId: 'hackathon-1', userId: 'judge-1' };

      prismaMock.judge.findUnique.mockResolvedValue(judge as any);
      prismaMock.score.count.mockResolvedValue(5);

      await expect(service.removeJudge('hackathon-1', 'judge-1', 'admin-1')).rejects.toThrow(BadRequestException);
      await expect(service.removeJudge('hackathon-1', 'judge-1', 'admin-1')).rejects.toThrow('Cannot remove judge who has already scored submissions');

      expect(prismaMock.judge.delete).not.toHaveBeenCalled();
    });
  });

  describe('createScore', () => {
    const createDto = {
      criterionId: 'criterion-1',
      value: 8,
      feedback: 'Great work!',
    };

    it('should successfully create a score', async () => {
      const submission = {
        id: 'submission-1',
        hackathonId: 'hackathon-1',
        status: 'FINAL',
        hackathon: {
          criteria: [
            { id: 'criterion-1', name: 'Innovation', maxScore: 10 },
          ],
        },
        team: {
          members: [
            { userId: 'user-1' },
            { userId: 'user-2' },
          ],
        },
      };

      const judge = { id: 'judge-1', userId: 'judge-user', hackathonId: 'hackathon-1' };
      const score = {
        id: 'score-1',
        submissionId: 'submission-1',
        judgeId: 'judge-1',
        criterionId: 'criterion-1',
        score: 8,
        feedback: 'Great work!',
        criterion: { id: 'criterion-1', name: 'Innovation' },
        judge: { id: 'judge-1', user: { id: 'judge-user', name: 'Judge', handle: 'judge' } },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission as any);
      prismaMock.judge.findUnique.mockResolvedValue(judge as any);
      prismaMock.score.findUnique.mockResolvedValue(null);
      prismaMock.score.create.mockResolvedValue(score as any);
      prismaMock.score.findMany.mockResolvedValue([score] as any);
      prismaMock.score.aggregate.mockResolvedValue({ _sum: { score: 80 }, _count: 10 } as any);
      prismaMock.submission.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.createScore('submission-1', createDto, 'judge-user');

      expect(result).toEqual(score);
      expect(prismaMock.score.create).toHaveBeenCalledWith({
        data: {
          submissionId: 'submission-1',
          judgeId: 'judge-1',
          criterionId: 'criterion-1',
          score: 8,
          feedback: 'Great work!',
        },
        include: expect.any(Object),
      });

      // Verify XP awarded to team members
      expect(gamificationService.awardXp).toHaveBeenCalledTimes(2);
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if submission not found', async () => {
      prismaMock.submission.findUnique.mockResolvedValue(null);

      await expect(service.createScore('non-existent', createDto, 'judge-user')).rejects.toThrow(NotFoundException);

      expect(prismaMock.score.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if submission not finalized', async () => {
      const submission = {
        id: 'submission-1',
        status: 'DRAFT',
        hackathon: { criteria: [] },
        team: { members: [] },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission as any);

      await expect(service.createScore('submission-1', createDto, 'judge-user')).rejects.toThrow(BadRequestException);
      await expect(service.createScore('submission-1', createDto, 'judge-user')).rejects.toThrow('Can only score finalized submissions');

      expect(prismaMock.score.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if criterion not found for hackathon', async () => {
      const submission = {
        id: 'submission-1',
        hackathonId: 'hackathon-1',
        status: 'FINAL',
        hackathon: {
          criteria: [
            { id: 'criterion-2', name: 'Other', maxScore: 10 },
          ],
        },
        team: { members: [] },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission as any);

      await expect(service.createScore('submission-1', createDto, 'judge-user')).rejects.toThrow(NotFoundException);
      await expect(service.createScore('submission-1', createDto, 'judge-user')).rejects.toThrow('Criterion not found for this hackathon');

      expect(prismaMock.score.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if score exceeds max', async () => {
      const submission = {
        id: 'submission-1',
        hackathonId: 'hackathon-1',
        status: 'FINAL',
        hackathon: {
          criteria: [
            { id: 'criterion-1', name: 'Innovation', maxScore: 5 },
          ],
        },
        team: { members: [] },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission as any);

      await expect(service.createScore('submission-1', createDto, 'judge-user')).rejects.toThrow(BadRequestException);
      await expect(service.createScore('submission-1', createDto, 'judge-user')).rejects.toThrow('Score cannot exceed maximum of 5 for this criterion');

      expect(prismaMock.score.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user not assigned as judge', async () => {
      const submission = {
        id: 'submission-1',
        hackathonId: 'hackathon-1',
        status: 'FINAL',
        hackathon: {
          criteria: [
            { id: 'criterion-1', name: 'Innovation', maxScore: 10 },
          ],
        },
        team: { members: [] },
      };

      prismaMock.submission.findUnique.mockResolvedValue(submission as any);
      prismaMock.judge.findUnique.mockResolvedValue(null);

      await expect(service.createScore('submission-1', createDto, 'judge-user')).rejects.toThrow(ForbiddenException);
      await expect(service.createScore('submission-1', createDto, 'judge-user')).rejects.toThrow('You are not assigned as a judge for this hackathon');

      expect(prismaMock.score.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if judge is team member', async () => {
      const submission = {
        id: 'submission-1',
        hackathonId: 'hackathon-1',
        status: 'FINAL',
        hackathon: {
          criteria: [
            { id: 'criterion-1', name: 'Innovation', maxScore: 10 },
          ],
        },
        team: {
          members: [
            { userId: 'judge-user' },
            { userId: 'user-2' },
          ],
        },
      };

      const judge = { id: 'judge-1', userId: 'judge-user', hackathonId: 'hackathon-1' };

      prismaMock.submission.findUnique.mockResolvedValue(submission as any);
      prismaMock.judge.findUnique.mockResolvedValue(judge as any);

      await expect(service.createScore('submission-1', createDto, 'judge-user')).rejects.toThrow(ForbiddenException);
      await expect(service.createScore('submission-1', createDto, 'judge-user')).rejects.toThrow('Cannot score your own team\'s submission');

      expect(prismaMock.score.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if judge already scored this criterion', async () => {
      const submission = {
        id: 'submission-1',
        hackathonId: 'hackathon-1',
        status: 'FINAL',
        hackathon: {
          criteria: [
            { id: 'criterion-1', name: 'Innovation', maxScore: 10 },
          ],
        },
        team: {
          members: [{ userId: 'user-1' }],
        },
      };

      const judge = { id: 'judge-1', userId: 'judge-user', hackathonId: 'hackathon-1' };
      const existingScore = { id: 'score-1', submissionId: 'submission-1', judgeId: 'judge-1', criterionId: 'criterion-1' };

      prismaMock.submission.findUnique.mockResolvedValue(submission as any);
      prismaMock.judge.findUnique.mockResolvedValue(judge as any);
      prismaMock.score.findUnique.mockResolvedValue(existingScore as any);

      await expect(service.createScore('submission-1', createDto, 'judge-user')).rejects.toThrow(ConflictException);

      expect(prismaMock.score.create).not.toHaveBeenCalled();
    });
  });

  describe('getScores', () => {
    it('should return all scores for a submission', async () => {
      const submission = { id: 'submission-1' };
      const scores = [
        {
          id: 'score-1',
          score: 8,
          criterion: { id: 'c1', name: 'Innovation' },
          judge: { user: { id: 'j1', name: 'Judge 1' } },
        },
        {
          id: 'score-2',
          score: 9,
          criterion: { id: 'c2', name: 'Design' },
          judge: { user: { id: 'j2', name: 'Judge 2' } },
        },
      ];

      prismaMock.submission.findUnique.mockResolvedValue(submission as any);
      prismaMock.score.findMany.mockResolvedValue(scores as any);

      const result = await service.getScores('submission-1');

      expect(result).toEqual(scores);
    });

    it('should throw NotFoundException if submission not found', async () => {
      prismaMock.submission.findUnique.mockResolvedValue(null);

      await expect(service.getScores('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateScore', () => {
    const updateDto = {
      value: 9,
      feedback: 'Excellent work!',
    };

    it('should successfully update a score', async () => {
      const score = {
        id: 'score-1',
        submissionId: 'submission-1',
        judge: {
          id: 'judge-1',
          userId: 'judge-user',
          user: { id: 'judge-user', name: 'Judge' },
        },
        criterion: {
          id: 'criterion-1',
          name: 'Innovation',
          maxScore: 10,
        },
        submission: { id: 'submission-1' },
      };

      const updated = {
        ...score,
        score: 9,
        feedback: 'Excellent work!',
      };

      prismaMock.score.findUnique.mockResolvedValue(score as any);
      prismaMock.score.update.mockResolvedValue(updated as any);
      prismaMock.score.findMany.mockResolvedValue([updated] as any);
      prismaMock.submission.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.updateScore('score-1', updateDto, 'judge-user');

      expect(result.score).toBe(9);
      expect(result.feedback).toBe('Excellent work!');
      expect(prismaMock.score.update).toHaveBeenCalledWith({
        where: { id: 'score-1' },
        data: {
          score: 9,
          feedback: 'Excellent work!',
        },
        include: expect.any(Object),
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if score not found', async () => {
      prismaMock.score.findUnique.mockResolvedValue(null);

      await expect(service.updateScore('non-existent', updateDto, 'judge-user')).rejects.toThrow(NotFoundException);

      expect(prismaMock.score.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if judge does not own the score', async () => {
      const score = {
        id: 'score-1',
        judge: {
          userId: 'other-judge',
          user: { id: 'other-judge' },
        },
        criterion: { maxScore: 10 },
      };

      prismaMock.score.findUnique.mockResolvedValue(score as any);

      await expect(service.updateScore('score-1', updateDto, 'judge-user')).rejects.toThrow(ForbiddenException);
      await expect(service.updateScore('score-1', updateDto, 'judge-user')).rejects.toThrow('You can only update your own scores');

      expect(prismaMock.score.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if value exceeds criterion max', async () => {
      const score = {
        id: 'score-1',
        judge: {
          userId: 'judge-user',
          user: { id: 'judge-user' },
        },
        criterion: {
          id: 'criterion-1',
          maxScore: 5,
        },
      };

      prismaMock.score.findUnique.mockResolvedValue(score as any);

      await expect(service.updateScore('score-1', { value: 8 }, 'judge-user')).rejects.toThrow(BadRequestException);
      await expect(service.updateScore('score-1', { value: 8 }, 'judge-user')).rejects.toThrow('Score cannot exceed maximum of 5 for this criterion');

      expect(prismaMock.score.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteScore', () => {
    it('should successfully delete a score', async () => {
      const score = {
        id: 'score-1',
        submissionId: 'submission-1',
        judge: {
          id: 'judge-1',
          userId: 'judge-user',
        },
      };

      prismaMock.score.findUnique.mockResolvedValue(score as any);
      prismaMock.score.delete.mockResolvedValue({} as any);
      prismaMock.score.findMany.mockResolvedValue([]);
      prismaMock.submission.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.deleteScore('score-1', 'judge-user');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Score deleted successfully');
      expect(prismaMock.score.delete).toHaveBeenCalledWith({
        where: { id: 'score-1' },
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if score not found', async () => {
      prismaMock.score.findUnique.mockResolvedValue(null);

      await expect(service.deleteScore('non-existent', 'judge-user')).rejects.toThrow(NotFoundException);

      expect(prismaMock.score.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if judge does not own the score', async () => {
      const score = {
        id: 'score-1',
        judge: {
          userId: 'other-judge',
        },
      };

      prismaMock.score.findUnique.mockResolvedValue(score as any);

      await expect(service.deleteScore('score-1', 'judge-user')).rejects.toThrow(ForbiddenException);
      await expect(service.deleteScore('score-1', 'judge-user')).rejects.toThrow('You can only delete your own scores');

      expect(prismaMock.score.delete).not.toHaveBeenCalled();
    });
  });

  describe('getJudgeAssignments', () => {
    it('should return judge assignments without hackathon filter', async () => {
      const judges = [
        {
          id: 'judge-1',
          userId: 'judge-user',
          hackathon: {
            id: 'hackathon-1',
            title: 'Test Hack',
            submissions: [
              {
                id: 'submission-1',
                status: 'FINAL',
                team: {
                  members: [
                    { user: { id: 'user-1', name: 'User 1', handle: 'user1', avatarUrl: null } },
                  ],
                },
                track: { id: 'track-1', name: 'Track 1' },
                _count: { scores: 3 },
              },
            ],
            criteria: [
              { id: 'criterion-1', name: 'Innovation' },
            ],
          },
        },
      ];

      prismaMock.judge.findMany.mockResolvedValue(judges as any);

      const result = await service.getJudgeAssignments('judge-user');

      expect(result).toEqual(judges);
      expect(prismaMock.judge.findMany).toHaveBeenCalledWith({
        where: { userId: 'judge-user' },
        include: expect.any(Object),
      });
    });

    it('should return judge assignments with hackathon filter', async () => {
      const judges = [
        {
          id: 'judge-1',
          userId: 'judge-user',
          hackathonId: 'hackathon-1',
          hackathon: {
            id: 'hackathon-1',
            title: 'Test Hack',
            submissions: [],
            criteria: [],
          },
        },
      ];

      prismaMock.judge.findMany.mockResolvedValue(judges as any);

      const result = await service.getJudgeAssignments('judge-user', 'hackathon-1');

      expect(result).toEqual(judges);
      expect(prismaMock.judge.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'judge-user',
          hackathonId: 'hackathon-1',
        },
        include: expect.any(Object),
      });
    });
  });

  describe('calculateRankings', () => {
    it('should successfully calculate rankings for hackathon', async () => {
      const hackathon = { id: 'hackathon-1', title: 'Test Hack' };
      const submissions = [
        { id: 'submission-1', scoreAggregate: 95 },
        { id: 'submission-2', scoreAggregate: 88 },
        { id: 'submission-3', scoreAggregate: 92 },
      ];

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon as any);
      prismaMock.submission.findMany.mockResolvedValue(submissions as any);
      prismaMock.submission.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.calculateRankings('hackathon-1', 'admin-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Rankings calculated successfully');
      expect(result.submissionsRanked).toBe(3);
      expect(prismaMock.submission.update).toHaveBeenCalledTimes(3);
      expect(prismaMock.submission.update).toHaveBeenNthCalledWith(1, expect.objectContaining({
        where: { id: 'submission-1' },
        data: { rank: 1 },
      }));
      expect(prismaMock.submission.update).toHaveBeenNthCalledWith(2, expect.objectContaining({
        where: { id: 'submission-2' },
        data: { rank: 2 },
      }));
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if hackathon not found', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.calculateRankings('non-existent', 'admin-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.submission.findMany).not.toHaveBeenCalled();
    });

    it('should handle hackathon with no scored submissions', async () => {
      const hackathon = { id: 'hackathon-1', title: 'Test Hack' };

      prismaMock.hackathon.findUnique.mockResolvedValue(hackathon as any);
      prismaMock.submission.findMany.mockResolvedValue([]);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.calculateRankings('hackathon-1', 'admin-1');

      expect(result.success).toBe(true);
      expect(result.submissionsRanked).toBe(0);
      expect(prismaMock.submission.update).not.toHaveBeenCalled();
    });
  });
});
