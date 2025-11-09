import { Test, TestingModule } from '@nestjs/testing';
import { HackathonsController } from './hackathons.controller';
import { HackathonsService } from './hackathons.service';
import { HackathonStatus } from '@innovation-lab/database';

describe('HackathonsController', () => {
  let controller: HackathonsController;
  let service: HackathonsService;

  const mockHackathonsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    findUserHackathons: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
    announceWinners: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackathonsController],
      providers: [
        {
          provide: HackathonsService,
          useValue: mockHackathonsService,
        },
      ],
    }).compile();

    controller = module.get<HackathonsController>(HackathonsController);
    service = module.get<HackathonsService>(HackathonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a hackathon', async () => {
      const createDto = { slug: 'test', title: 'Test Hackathon', startsAt: new Date(), endsAt: new Date() } as any;
      const hackathon = { id: 'h1', ...createDto };
      const user = { id: 'user-1' };
      mockHackathonsService.create.mockResolvedValue(hackathon);

      const result = await controller.create(createDto, user as any);

      expect(result).toEqual(hackathon);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return all hackathons', async () => {
      const query = { status: HackathonStatus.LIVE, page: 1, limit: 10 };
      const hackathons = { data: [], meta: {} };
      mockHackathonsService.findAll.mockResolvedValue(hackathons);

      const result = await controller.findAll(query);

      expect(result).toEqual(hackathons);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a hackathon by ID', async () => {
      const hackathon = { id: 'h1', title: 'Test' };
      mockHackathonsService.findOne.mockResolvedValue(hackathon);

      const result = await controller.findOne('h1');

      expect(result).toEqual(hackathon);
      expect(service.findOne).toHaveBeenCalledWith('h1');
    });
  });

  describe('findBySlug', () => {
    it('should return a hackathon by slug', async () => {
      const hackathon = { id: 'h1', slug: 'test' };
      mockHackathonsService.findBySlug.mockResolvedValue(hackathon);

      const result = await controller.findBySlug('test');

      expect(result).toEqual(hackathon);
      expect(service.findBySlug).toHaveBeenCalledWith('test');
    });
  });

  describe('getMyHackathons', () => {
    it('should return user hackathons', async () => {
      const hackathons = [{ id: 'h1' }];
      const user = { id: 'user-1' };
      mockHackathonsService.findUserHackathons.mockResolvedValue(hackathons);

      const result = await controller.getMyHackathons(user as any);

      expect(result).toEqual(hackathons);
      expect(service.findUserHackathons).toHaveBeenCalledWith('user-1');
    });
  });

  describe('update', () => {
    it('should update a hackathon', async () => {
      const updateDto = { title: 'Updated' };
      const updated = { id: 'h1', ...updateDto };
      const user = { id: 'user-1' };
      mockHackathonsService.update.mockResolvedValue(updated);

      const result = await controller.update('h1', updateDto, user as any);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('h1', updateDto, 'user-1');
    });
  });

  describe('remove', () => {
    it('should delete a hackathon', async () => {
      const response = { success: true, message: 'Deleted' };
      const user = { id: 'user-1' };
      mockHackathonsService.remove.mockResolvedValue(response);

      const result = await controller.remove('h1', user as any);

      expect(result).toEqual(response);
      expect(service.remove).toHaveBeenCalledWith('h1', 'user-1');
    });
  });

  describe('getStats', () => {
    it('should return hackathon statistics', async () => {
      const stats = { teams: 10, submissions: 20 };
      mockHackathonsService.getStats.mockResolvedValue(stats);

      const result = await controller.getStats('h1');

      expect(result).toEqual(stats);
      expect(service.getStats).toHaveBeenCalledWith('h1');
    });
  });

  describe('announceWinners', () => {
    it('should announce winners', async () => {
      const winnersDto = { winners: [] };
      const response = { success: true, results: [] };
      const user = { id: 'admin-1' };
      mockHackathonsService.announceWinners.mockResolvedValue(response);

      const result = await controller.announceWinners('h1', winnersDto, user as any);

      expect(result).toEqual(response);
      expect(service.announceWinners).toHaveBeenCalledWith('h1', winnersDto, 'admin-1');
    });
  });
});
