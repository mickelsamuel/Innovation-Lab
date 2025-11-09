import { Test, TestingModule } from '@nestjs/testing';
import { JudgingController } from './judging.controller';
import { JudgingService } from './judging.service';

describe('JudgingController', () => {
  let controller: JudgingController;
  let service: JudgingService;

  const mockJudgingService = {
    assignJudge: jest.fn(),
    getJudges: jest.fn(),
    removeJudge: jest.fn(),
    createScore: jest.fn(),
    getScores: jest.fn(),
    updateScore: jest.fn(),
    deleteScore: jest.fn(),
    getJudgeAssignments: jest.fn(),
    calculateRankings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JudgingController],
      providers: [
        {
          provide: JudgingService,
          useValue: mockJudgingService,
        },
      ],
    }).compile();

    controller = module.get<JudgingController>(JudgingController);
    service = module.get<JudgingService>(JudgingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('assignJudge', () => {
    it('should assign a judge to hackathon', async () => {
      const dto = { userId: 'judge-1' } as any;
      const assignment = { id: 'a1', hackathonId: 'h1', userId: 'judge-1' };
      const user = { id: 'admin-1' };
      mockJudgingService.assignJudge.mockResolvedValue(assignment);

      const result = await controller.assignJudge('h1', dto, user as any);

      expect(result).toEqual(assignment);
      expect(service.assignJudge).toHaveBeenCalledWith('h1', dto, 'admin-1');
    });
  });

  describe('getJudges', () => {
    it('should return all judges for hackathon', async () => {
      const judges = [{ id: 'j1', userId: 'judge-1' }];
      mockJudgingService.getJudges.mockResolvedValue(judges);

      const result = await controller.getJudges('h1');

      expect(result).toEqual(judges);
      expect(service.getJudges).toHaveBeenCalledWith('h1');
    });
  });

  describe('removeJudge', () => {
    it('should remove a judge from hackathon', async () => {
      const response = { success: true, message: 'Judge removed' };
      const user = { id: 'admin-1' };
      mockJudgingService.removeJudge.mockResolvedValue(response);

      const result = await controller.removeJudge('h1', 'judge-1', user as any);

      expect(result).toEqual(response);
      expect(service.removeJudge).toHaveBeenCalledWith('h1', 'judge-1', 'admin-1');
    });
  });

  describe('createScore', () => {
    it('should create a score for submission', async () => {
      const dto = {
        criterion: 'INNOVATION',
        score: 8,
        comment: 'Good work',
      } as any;
      const score = { id: 'sc1', ...dto };
      const user = { id: 'judge-1' };
      mockJudgingService.createScore.mockResolvedValue(score);

      const result = await controller.createScore('s1', dto, user as any);

      expect(result).toEqual(score);
      expect(service.createScore).toHaveBeenCalledWith('s1', dto, 'judge-1');
    });
  });

  describe('getScores', () => {
    it('should return all scores for submission', async () => {
      const scores = [{ id: 'sc1', criterion: 'INNOVATION', score: 8 }];
      mockJudgingService.getScores.mockResolvedValue(scores);

      const result = await controller.getScores('s1');

      expect(result).toEqual(scores);
      expect(service.getScores).toHaveBeenCalledWith('s1');
    });
  });

  describe('updateScore', () => {
    it('should update a score', async () => {
      const dto = { score: 9, comment: 'Excellent' } as any;
      const updated = { id: 'sc1', ...dto };
      const user = { id: 'judge-1' };
      mockJudgingService.updateScore.mockResolvedValue(updated);

      const result = await controller.updateScore('sc1', dto, user as any);

      expect(result).toEqual(updated);
      expect(service.updateScore).toHaveBeenCalledWith('sc1', dto, 'judge-1');
    });
  });

  describe('deleteScore', () => {
    it('should delete a score', async () => {
      const response = { success: true, message: 'Score deleted' };
      const user = { id: 'judge-1' };
      mockJudgingService.deleteScore.mockResolvedValue(response);

      const result = await controller.deleteScore('sc1', user as any);

      expect(result).toEqual(response);
      expect(service.deleteScore).toHaveBeenCalledWith('sc1', 'judge-1');
    });
  });

  describe('getJudgeAssignments', () => {
    it('should return judge assignments', async () => {
      const assignments = [{ id: 's1', title: 'Submission 1' }];
      const user = { id: 'judge-1' };
      mockJudgingService.getJudgeAssignments.mockResolvedValue(assignments);

      const result = await controller.getJudgeAssignments(user as any, 'h1');

      expect(result).toEqual(assignments);
      expect(service.getJudgeAssignments).toHaveBeenCalledWith('judge-1', 'h1');
    });

    it('should return all assignments without hackathon filter', async () => {
      const assignments = [{ id: 's1' }];
      const user = { id: 'judge-1' };
      mockJudgingService.getJudgeAssignments.mockResolvedValue(assignments);

      const result = await controller.getJudgeAssignments(user as any);

      expect(result).toEqual(assignments);
      expect(service.getJudgeAssignments).toHaveBeenCalledWith('judge-1', undefined);
    });
  });

  describe('calculateRankings', () => {
    it('should calculate rankings for hackathon', async () => {
      const rankings = [
        { submissionId: 's1', totalScore: 85, rank: 1 },
        { submissionId: 's2', totalScore: 78, rank: 2 },
      ];
      const user = { id: 'admin-1' };
      mockJudgingService.calculateRankings.mockResolvedValue(rankings);

      const result = await controller.calculateRankings('h1', user as any);

      expect(result).toEqual(rankings);
      expect(service.calculateRankings).toHaveBeenCalledWith('h1', 'admin-1');
    });
  });
});
