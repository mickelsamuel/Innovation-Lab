import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return user', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        roles: ['USER'],
      };
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        handle: 'testuser',
        roles: ['USER'],
        isActive: true,
        isBanned: false,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        roles: user.roles,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          handle: true,
          roles: true,
          isActive: true,
          isBanned: true,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        roles: ['USER'],
      };
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        new UnauthorizedException('User not found')
      );
    });

    it('should throw UnauthorizedException if user is banned', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        roles: ['USER'],
      };
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        handle: 'testuser',
        roles: ['USER'],
        isActive: true,
        isBanned: true,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(strategy.validate(payload)).rejects.toThrow(
        new UnauthorizedException('Account has been banned')
      );
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        roles: ['USER'],
      };
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        handle: 'testuser',
        roles: ['USER'],
        isActive: false,
        isBanned: false,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(strategy.validate(payload)).rejects.toThrow(
        new UnauthorizedException('Account is not active')
      );
    });
  });
});
