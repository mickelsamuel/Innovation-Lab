import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockHealthService = {
    check: jest.fn(),
    checkReadiness: jest.fn(),
    getPlatformStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', async () => {
      const healthStatus = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };
      mockHealthService.check.mockResolvedValue(healthStatus);

      const result = await controller.check();

      expect(result).toEqual(healthStatus);
      expect(service.check).toHaveBeenCalled();
    });
  });

  describe('ready', () => {
    it('should return readiness status', async () => {
      const readinessStatus = {
        status: 'ok',
        info: { database: { status: 'up' }, redis: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' }, redis: { status: 'up' } },
      };
      mockHealthService.checkReadiness.mockResolvedValue(readinessStatus);

      const result = await controller.ready();

      expect(result).toEqual(readinessStatus);
      expect(service.checkReadiness).toHaveBeenCalled();
    });
  });

  describe('live', () => {
    it('should return liveness status', async () => {
      const result = await controller.live();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(typeof result.uptime).toBe('number');
    });
  });

  describe('getStats', () => {
    it('should return platform statistics', async () => {
      const stats = {
        users: 100,
        hackathons: 10,
        teams: 50,
        submissions: 75,
        challenges: 20,
      };
      mockHealthService.getPlatformStats.mockResolvedValue(stats);

      const result = await controller.getStats();

      expect(result).toEqual(stats);
      expect(service.getPlatformStats).toHaveBeenCalled();
    });
  });
});
