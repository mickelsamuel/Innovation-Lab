import { Test, TestingModule } from '@nestjs/testing';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';

describe('ChallengesController', () => {
  let controller: ChallengesController;
  let service: ChallengesService;

  const mockChallengesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    submitSolution: jest.fn(),
    getChallengeSubmissions: jest.fn(),
    getUserSubmissions: jest.fn(),
    getCompletedCount: jest.fn(),
    reviewSubmission: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallengesController],
      providers: [
        {
          provide: ChallengesService,
          useValue: mockChallengesService,
        },
      ],
    }).compile();

    controller = module.get<ChallengesController>(ChallengesController);
    service = module.get<ChallengesService>(ChallengesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a challenge', async () => {
      const createDto = {
        slug: 'test-challenge',
        title: 'Test Challenge',
        difficulty: 'EASY',
      } as any;
      const challenge = { id: 'c1', ...createDto };
      const req = { user: { id: 'user-1' } };
      mockChallengesService.create.mockResolvedValue(challenge);

      const result = await controller.create(req, createDto);

      expect(result).toEqual(challenge);
      expect(service.create).toHaveBeenCalledWith('user-1', createDto);
    });
  });

  describe('findAll', () => {
    it('should return all challenges', async () => {
      const challenges = [{ id: 'c1' }];
      mockChallengesService.findAll.mockResolvedValue(challenges);

      const result = await controller.findAll();

      expect(result).toEqual(challenges);
      expect(service.findAll).toHaveBeenCalledWith({
        status: undefined,
        category: undefined,
        skill: undefined,
        ownerId: undefined,
        search: undefined,
      });
    });

    it('should return filtered challenges', async () => {
      const challenges = [{ id: 'c1', status: 'ACTIVE' }];
      mockChallengesService.findAll.mockResolvedValue(challenges);

      const result = await controller.findAll(
        'ACTIVE' as any,
        'algorithms',
        'javascript',
        'owner-1',
        'test'
      );

      expect(result).toEqual(challenges);
      expect(service.findAll).toHaveBeenCalledWith({
        status: 'ACTIVE',
        category: 'algorithms',
        skill: 'javascript',
        ownerId: 'owner-1',
        search: 'test',
      });
    });
  });

  describe('findOne', () => {
    it('should return a challenge by ID', async () => {
      const challenge = { id: 'c1', title: 'Test' };
      mockChallengesService.findOne.mockResolvedValue(challenge);

      const result = await controller.findOne('c1');

      expect(result).toEqual(challenge);
      expect(service.findOne).toHaveBeenCalledWith('c1');
    });
  });

  describe('findBySlug', () => {
    it('should return a challenge by slug', async () => {
      const challenge = { id: 'c1', slug: 'test-challenge' };
      mockChallengesService.findBySlug.mockResolvedValue(challenge);

      const result = await controller.findBySlug('test-challenge');

      expect(result).toEqual(challenge);
      expect(service.findBySlug).toHaveBeenCalledWith('test-challenge');
    });
  });

  describe('update', () => {
    it('should update a challenge', async () => {
      const updateDto = { title: 'Updated' };
      const updated = { id: 'c1', ...updateDto };
      const req = { user: { id: 'user-1', role: 'BANK_ADMIN' } };
      mockChallengesService.update.mockResolvedValue(updated);

      const result = await controller.update('c1', req, updateDto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('c1', 'user-1', 'BANK_ADMIN', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a challenge', async () => {
      const req = { user: { id: 'user-1', role: 'BANK_ADMIN' } };
      mockChallengesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('c1', req);

      expect(result).toEqual({ message: 'Challenge deleted successfully' });
      expect(service.remove).toHaveBeenCalledWith('c1', 'user-1', 'BANK_ADMIN');
    });
  });

  describe('submitSolution', () => {
    it('should submit solution to challenge', async () => {
      const submitDto = {
        code: 'console.log("solution")',
        language: 'javascript',
      } as any;
      const submission = { id: 's1', ...submitDto };
      const req = { user: { id: 'user-1' } };
      mockChallengesService.submitSolution.mockResolvedValue(submission);

      const result = await controller.submitSolution('c1', req, submitDto);

      expect(result).toEqual(submission);
      expect(service.submitSolution).toHaveBeenCalledWith('c1', 'user-1', submitDto);
    });
  });

  describe('getChallengeSubmissions', () => {
    it('should return challenge submissions', async () => {
      const submissions = [{ id: 's1' }];
      mockChallengesService.getChallengeSubmissions.mockResolvedValue(submissions);

      const result = await controller.getChallengeSubmissions('c1');

      expect(result).toEqual(submissions);
      expect(service.getChallengeSubmissions).toHaveBeenCalledWith('c1');
    });
  });

  describe('getUserSubmissions', () => {
    it('should return user submissions', async () => {
      const submissions = [{ id: 's1' }];
      const req = { user: { id: 'user-1' } };
      mockChallengesService.getUserSubmissions.mockResolvedValue(submissions);

      const result = await controller.getUserSubmissions(req);

      expect(result).toEqual(submissions);
      expect(service.getUserSubmissions).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getCompletedCount', () => {
    it('should return completed challenges count', async () => {
      const count = 10;
      const req = { user: { id: 'user-1' } };
      mockChallengesService.getCompletedCount.mockResolvedValue(count);

      const result = await controller.getCompletedCount(req);

      expect(result).toEqual(count);
      expect(service.getCompletedCount).toHaveBeenCalledWith('user-1');
    });
  });

  describe('reviewSubmission', () => {
    it('should review a submission', async () => {
      const reviewDto = {
        status: 'ACCEPTED',
        feedback: 'Good solution',
      } as any;
      const reviewed = { id: 's1', ...reviewDto };
      const req = { user: { id: 'user-1', role: 'BANK_ADMIN' } };
      mockChallengesService.reviewSubmission.mockResolvedValue(reviewed);

      const result = await controller.reviewSubmission('s1', req, reviewDto);

      expect(result).toEqual(reviewed);
      expect(service.reviewSubmission).toHaveBeenCalledWith(
        's1',
        'user-1',
        'BANK_ADMIN',
        reviewDto
      );
    });
  });
});
