import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let service: SubmissionsService;

  const mockSubmissionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findUserSubmissions: jest.fn(),
    update: jest.fn(),
    submit: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        {
          provide: SubmissionsService,
          useValue: mockSubmissionsService,
        },
      ],
    }).compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
    service = module.get<SubmissionsService>(SubmissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a submission', async () => {
      const createDto = { hackathonId: 'h1', teamId: 't1', title: 'Project' } as any;
      const submission = { id: 's1', ...createDto };
      mockSubmissionsService.create.mockResolvedValue(submission);

      const user = { id: 'user-1' };
      const result = await controller.create(createDto, user as any);

      expect(result).toEqual(submission);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return all submissions for a hackathon', async () => {
      const submissions = [{ id: 's1' }];
      mockSubmissionsService.findAll.mockResolvedValue(submissions);

      const result = await controller.findAll('h1', undefined);

      expect(result).toEqual(submissions);
      expect(service.findAll).toHaveBeenCalledWith('h1', undefined);
    });

    it('should filter by status', async () => {
      const submissions = [{ id: 's1', status: 'FINAL' }];
      mockSubmissionsService.findAll.mockResolvedValue(submissions);

      const result = await controller.findAll('h1', 'FINAL' as any);

      expect(result).toEqual(submissions);
      expect(service.findAll).toHaveBeenCalledWith('h1', 'FINAL');
    });
  });

  describe('findOne', () => {
    it('should return a submission by ID', async () => {
      const submission = { id: 's1', title: 'Project' };
      mockSubmissionsService.findOne.mockResolvedValue(submission);

      const result = await controller.findOne('s1');

      expect(result).toEqual(submission);
      expect(service.findOne).toHaveBeenCalledWith('s1');
    });
  });

  describe('getMySubmissions', () => {
    it('should return user submissions', async () => {
      const submissions = [{ id: 's1' }];
      mockSubmissionsService.findUserSubmissions.mockResolvedValue(submissions);

      const user = { id: 'user-1' };
      const result = await controller.getMySubmissions(user as any);

      expect(result).toEqual(submissions);
      expect(service.findUserSubmissions).toHaveBeenCalledWith('user-1');
    });
  });

  describe('update', () => {
    it('should update a submission', async () => {
      const updateDto = { title: 'Updated' };
      const updated = { id: 's1', ...updateDto };
      mockSubmissionsService.update.mockResolvedValue(updated);

      const user = { id: 'user-1' };
      const result = await controller.update('s1', updateDto, user as any);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('s1', updateDto, 'user-1');
    });
  });

  describe('submit', () => {
    it('should finalize a submission', async () => {
      const finalized = { id: 's1', status: 'FINAL' };
      mockSubmissionsService.submit.mockResolvedValue(finalized);

      const user = { id: 'user-1' };
      const result = await controller.submit('s1', user as any);

      expect(result).toEqual(finalized);
      expect(service.submit).toHaveBeenCalledWith('s1', 'user-1');
    });
  });

  describe('remove', () => {
    it('should delete a submission', async () => {
      const response = { success: true, message: 'Deleted' };
      mockSubmissionsService.remove.mockResolvedValue(response);

      const user = { id: 'user-1' };
      const result = await controller.remove('s1', user as any);

      expect(result).toEqual(response);
      expect(service.remove).toHaveBeenCalledWith('s1', 'user-1');
    });
  });
});
