import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import * as fs from 'fs';

// Mock nodemailer
const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
const mockCreateTransport = jest.fn().mockReturnValue({
  sendMail: mockSendMail,
});

jest.mock('nodemailer', () => ({
  createTransport: (...args: any[]) => mockCreateTransport(...args),
}));

// Mock fs
jest.mock('fs');

describe('EmailService', () => {
  let service: EmailService;

  const mockTemplate = '<html><body>Hello {{name}}! Visit {{baseUrl}}</body></html>';

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.readFileSync as jest.Mock).mockReturnValue(mockTemplate);
  });

  describe('Gmail Configuration', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => {
                const config: Record<string, any> = {
                  EMAIL_SERVICE: 'gmail',
                  EMAIL_FROM: 'test@gmail.com',
                  EMAIL_USER: 'test@gmail.com',
                  EMAIL_PASSWORD: 'password123',
                  FRONTEND_URL: 'https://example.com',
                };
                return config[key] !== undefined ? config[key] : defaultValue;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize Gmail transporter', () => {
      expect(mockCreateTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'test@gmail.com',
          pass: 'password123',
        },
      });
    });
  });

  describe('Custom SMTP Configuration', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => {
                const config: Record<string, any> = {
                  EMAIL_HOST: 'smtp.example.com',
                  EMAIL_PORT: 587,
                  EMAIL_USER: 'user@example.com',
                  EMAIL_PASSWORD: 'password123',
                  EMAIL_FROM: 'noreply@example.com',
                  FRONTEND_URL: 'https://example.com',
                };
                return config[key] !== undefined ? config[key] : defaultValue;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
    });

    it('should initialize custom SMTP transporter', () => {
      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'user@example.com',
          pass: 'password123',
        },
      });
    });

    it('should use secure connection on port 465', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => {
                const config: Record<string, any> = {
                  EMAIL_HOST: 'smtp.example.com',
                  EMAIL_PORT: 465,
                  EMAIL_USER: 'user@example.com',
                  EMAIL_PASSWORD: 'password123',
                  EMAIL_FROM: 'noreply@example.com',
                  FRONTEND_URL: 'https://example.com',
                };
                return config[key] !== undefined ? config[key] : defaultValue;
              }),
            },
          },
        ],
      }).compile();

      module.get<EmailService>(EmailService);

      expect(mockCreateTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.example.com',
          port: 465,
          secure: true,
        })
      );
    });
  });

  describe('Development Mode (No Config)', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((_key: string, defaultValue?: any) => {
                return defaultValue;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
    });

    it('should initialize stream transport in dev mode', () => {
      expect(mockCreateTransport).toHaveBeenCalledWith({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    });
  });

  describe('sendEmail', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => {
                const config: Record<string, any> = {
                  EMAIL_FROM: 'test@example.com',
                  FRONTEND_URL: 'https://example.com',
                };
                return config[key] !== undefined ? config[key] : defaultValue;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
    });

    it('should send email with template', async () => {
      await service.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        template: 'test-template',
        context: {
          name: 'John Doe',
        },
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: expect.stringContaining('John Doe'),
      });
    });

    it('should replace template variables', async () => {
      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        template: 'test',
        context: {
          name: 'Jane',
        },
      });

      const html = mockSendMail.mock.calls[0][0].html;
      expect(html).toContain('Jane');
      expect(html).toContain('https://example.com');
    });

    it('should handle template loading errors', async () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Template not found');
      });

      await expect(
        service.sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          template: 'non-existent',
          context: {},
        })
      ).rejects.toThrow('Email template not found: non-existent');
    });

    it('should handle email sending errors', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(
        service.sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          template: 'test',
          context: {},
        })
      ).rejects.toThrow('SMTP error');
    });
  });

  describe('Email Methods', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => {
                const config: Record<string, any> = {
                  EMAIL_FROM: 'test@example.com',
                  FRONTEND_URL: 'https://example.com',
                };
                return config[key] !== undefined ? config[key] : defaultValue;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
    });

    it('should send welcome email', async () => {
      await service.sendWelcomeEmail('user@example.com', 'John');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Welcome'),
        })
      );
    });

    it('should send level up email', async () => {
      await service.sendLevelUpEmail('user@example.com', 'John', 5, 'Expert');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Level 5'),
        })
      );
    });

    it('should send badge unlocked email', async () => {
      await service.sendBadgeUnlockedEmail(
        'user@example.com',
        'John',
        'First Win',
        '🏆',
        'Won your first hackathon'
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('First Win'),
        })
      );
    });

    it('should send winner announcement email with 1st place', async () => {
      await service.sendWinnerAnnouncementEmail(
        'user@example.com',
        'John',
        'Test Hackathon',
        1,
        '$1000'
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('1st Place'),
        })
      );
    });

    it('should send winner announcement email with 2nd place', async () => {
      await service.sendWinnerAnnouncementEmail(
        'user@example.com',
        'John',
        'Test Hackathon',
        2
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('2nd Place'),
        })
      );
    });

    it('should send winner announcement email with 3rd place', async () => {
      await service.sendWinnerAnnouncementEmail(
        'user@example.com',
        'John',
        'Test Hackathon',
        3
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('3rd Place'),
        })
      );
    });

    it('should send challenge accepted email', async () => {
      await service.sendChallengeAcceptedEmail(
        'user@example.com',
        'John',
        'Test Challenge',
        'test-challenge'
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('accepted'),
        })
      );
    });

    it('should send challenge winner email', async () => {
      await service.sendChallengeWinnerEmail(
        'user@example.com',
        'John',
        'Test Challenge',
        'test-challenge',
        '500 XP'
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('won'),
        })
      );
    });

    it('should send challenge winner email without reward', async () => {
      await service.sendChallengeWinnerEmail(
        'user@example.com',
        'John',
        'Test Challenge',
        'test-challenge'
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
        })
      );
    });

    it('should send team invitation email', async () => {
      await service.sendTeamInvitationEmail(
        'invitee@example.com',
        'Jane',
        'Team Awesome',
        'John',
        'Test Hackathon',
        'test-hackathon'
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'invitee@example.com',
          subject: expect.stringContaining('Team Awesome'),
        })
      );
    });

    it('should send submission confirmation email', async () => {
      await service.sendSubmissionConfirmationEmail(
        'user@example.com',
        'John',
        'Test Hackathon',
        'test-hackathon',
        'Team Awesome'
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('confirmed'),
        })
      );
    });
  });
});
