import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    setup2FA: jest.fn(),
    verify2FA: jest.fn(),
    enable2FA: jest.fn(),
    disable2FA: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        handle: 'testuser',
      } as any;
      const response = {
        user: { id: 'user-1', email: 'test@example.com' },
        accessToken: 'token',
        refreshToken: 'refresh',
      };
      mockAuthService.register.mockResolvedValue(response);

      const result = await controller.register(registerDto);

      expect(result).toEqual(response);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      } as any;
      const response = {
        user: { id: 'user-1', email: 'test@example.com' },
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };
      mockAuthService.login.mockResolvedValue(response);

      const result = await controller.login(loginDto);

      expect(result).toEqual(response);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    it('should refresh access token', async () => {
      const refreshToken = 'refresh-token';
      const response = {
        accessToken: 'new-token',
        expiresIn: 3600,
      };
      mockAuthService.refreshToken.mockResolvedValue(response);

      const result = await controller.refresh(refreshToken);

      expect(result).toEqual(response);
      expect(service.refreshToken).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      const user = { id: 'user-1', email: 'test@example.com' };
      const req = { user };

      const result = await controller.getMe(req);

      expect(result).toEqual(user);
    });
  });

  describe('setup2FA', () => {
    it('should setup 2FA for user', async () => {
      const response = {
        secret: 'secret-key',
        qrCode: 'qr-code-url',
      };
      const req = { user: { id: 'user-1' } };
      mockAuthService.setup2FA.mockResolvedValue(response);

      const result = await controller.setup2FA(req);

      expect(result).toEqual(response);
      expect(service.setup2FA).toHaveBeenCalledWith('user-1');
    });
  });

  describe('enable2FA', () => {
    it('should enable 2FA with valid token', async () => {
      const req = { user: { id: 'user-1' } };
      const body = { secret: 'secret-key', token: '123456' };
      mockAuthService.verify2FA.mockReturnValue(true);
      mockAuthService.enable2FA.mockResolvedValue(undefined);

      const result = await controller.enable2FA(req, body);

      expect(result).toEqual({ success: true, message: '2FA enabled successfully' });
      expect(service.verify2FA).toHaveBeenCalledWith('secret-key', '123456');
      expect(service.enable2FA).toHaveBeenCalledWith('user-1', 'secret-key');
    });

    it('should fail with invalid token', async () => {
      const req = { user: { id: 'user-1' } };
      const body = { secret: 'secret-key', token: 'invalid' };
      mockAuthService.verify2FA.mockReturnValue(false);

      const result = await controller.enable2FA(req, body);

      expect(result).toEqual({ success: false, message: 'Invalid 2FA token' });
      expect(service.verify2FA).toHaveBeenCalledWith('secret-key', 'invalid');
      expect(service.enable2FA).not.toHaveBeenCalled();
    });
  });

  describe('disable2FA', () => {
    it('should disable 2FA', async () => {
      const req = { user: { id: 'user-1' } };
      mockAuthService.disable2FA.mockResolvedValue(undefined);

      const result = await controller.disable2FA(req);

      expect(result).toEqual({ success: true, message: '2FA disabled successfully' });
      expect(service.disable2FA).toHaveBeenCalledWith('user-1');
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const dto = { email: 'test@example.com' } as any;
      const response = {
        success: true,
        message: 'If the email exists, a reset link has been sent',
      };
      mockAuthService.forgotPassword.mockResolvedValue(response);

      const result = await controller.forgotPassword(dto);

      expect(result).toEqual(response);
      expect(service.forgotPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const dto = {
        token: 'reset-token',
        password: 'newPassword123',
      } as any;
      const response = {
        success: true,
        message: 'Password reset successfully',
      };
      mockAuthService.resetPassword.mockResolvedValue(response);

      const result = await controller.resetPassword(dto);

      expect(result).toEqual(response);
      expect(service.resetPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const result = await controller.logout();

      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
    });
  });
});
