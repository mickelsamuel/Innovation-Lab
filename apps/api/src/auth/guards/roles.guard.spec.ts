import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const mockExecutionContext = (user: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as any;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const context = mockExecutionContext({ id: 'user-1', roles: ['USER'] });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when no roles array is empty', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      const context = mockExecutionContext({ id: 'user-1', roles: ['USER'] });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['USER']);
      const context = mockExecutionContext({ id: 'user-1', roles: ['USER'] });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['BANK_ADMIN', 'ORGANIZER']);
      const context = mockExecutionContext({ id: 'user-1', roles: ['ORGANIZER'] });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user is not present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['USER']);
      const context = mockExecutionContext(null);

      expect(() => guard.canActivate(context)).toThrow(new ForbiddenException('Access denied'));
    });

    it('should throw ForbiddenException when user has no roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['USER']);
      const context = mockExecutionContext({ id: 'user-1' });

      expect(() => guard.canActivate(context)).toThrow(new ForbiddenException('Access denied'));
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['BANK_ADMIN']);
      const context = mockExecutionContext({ id: 'user-1', roles: ['USER'] });

      expect(() => guard.canActivate(context)).toThrow(
        new ForbiddenException('Insufficient permissions')
      );
    });

    it('should allow access when user has multiple roles including required one', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['BANK_ADMIN']);
      const context = mockExecutionContext({
        id: 'user-1',
        roles: ['USER', 'BANK_ADMIN', 'ORGANIZER'],
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
