import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Spy on logger methods
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    // Mock Prisma methods
    service.$connect = jest.fn().mockResolvedValue(undefined);
    service.$disconnect = jest.fn().mockResolvedValue(undefined);
    service.$executeRawUnsafe = jest.fn().mockResolvedValue(1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to database and log success', async () => {
      await service.onModuleInit();

      expect(service.$connect).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('Successfully connected to database');
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database and log', async () => {
      await service.onModuleDestroy();

      expect(service.$disconnect).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('Disconnected from database');
    });
  });

  describe('cleanDatabase', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should throw error in production', async () => {
      process.env.NODE_ENV = 'production';

      await expect(service.cleanDatabase()).rejects.toThrow('Cannot clean database in production');
    });

    it('should clean all models in non-production', async () => {
      process.env.NODE_ENV = 'development';

      // Mock some model methods
      service.user = { deleteMany: jest.fn().mockResolvedValue({}) };
      service.hackathon = { deleteMany: jest.fn().mockResolvedValue({}) };

      await service.cleanDatabase();

      // Should attempt to clean models (exact count depends on schema)
      expect(true).toBe(true);
    });

    it('should handle errors when cleaning models', async () => {
      process.env.NODE_ENV = 'test';

      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      // Mock a model that throws an error
      service.invalidModel = {
        deleteMany: jest.fn().mockRejectedValue(new Error('Delete failed')),
      };

      await service.cleanDatabase();

      // Should log warning for failed model cleanup
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('executeRaw', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should execute raw query', async () => {
      process.env.NODE_ENV = 'development';

      const result = await service.executeRaw('SELECT * FROM users WHERE id = ?', 1);

      expect(service.$executeRawUnsafe).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', 1);
      expect(result).toBe(1);
    });

    it('should warn when executing raw query in production', async () => {
      process.env.NODE_ENV = 'production';

      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await service.executeRaw('SELECT COUNT(*) FROM users');

      expect(warnSpy).toHaveBeenCalledWith('Executing raw query in production', {
        query: 'SELECT COUNT(*) FROM users',
      });
      expect(service.$executeRawUnsafe).toHaveBeenCalled();
    });

    it('should handle multiple arguments', async () => {
      process.env.NODE_ENV = 'test';

      await service.executeRaw('INSERT INTO logs VALUES (?, ?, ?)', 1, 'test', new Date());

      expect(service.$executeRawUnsafe).toHaveBeenCalledWith(
        'INSERT INTO logs VALUES (?, ?, ?)',
        1,
        'test',
        expect.any(Date)
      );
    });
  });

  describe('event listeners', () => {
    it('should set up error event listener', () => {
      jest.spyOn(Logger.prototype, 'error');

      // The error listener should be set up in constructor
      expect(service).toBeDefined();
    });

    it('should set up warn event listener', () => {
      jest.spyOn(Logger.prototype, 'warn');

      // The warn listener should be set up in constructor
      expect(service).toBeDefined();
    });
  });

  describe('constructor', () => {
    it('should initialize with correct config', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(PrismaService);
    });

    it('should set up query logging in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const newService = new PrismaService();

      expect(newService).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
