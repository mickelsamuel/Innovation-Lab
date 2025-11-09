import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('Authentication (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global pipes like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();

    // Clean database before tests
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    // Clean up after all tests
    await cleanDatabase(prisma);
    await app.close();
  });

  describe('/v1/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      const registerDto = {
        name: 'E2E Test User',
        email: 'e2e@test.com',
        handle: 'e2euser',
        password: 'SecurePass123!',
        organization: 'E2E Test Org',
        acceptTerms: true,
      };

      return request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'e2e@test.com');
          expect(res.body).toHaveProperty('name', 'E2E Test User');
          expect(res.body).toHaveProperty('handle', 'e2euser');
          expect(res.body).toHaveProperty('message');
          expect(res.body).not.toHaveProperty('password');

          userId = res.body.id;
        });
    });

    it('should reject duplicate email', () => {
      const registerDto = {
        name: 'Another User',
        email: 'e2e@test.com', // Same email
        handle: 'anotheruser',
        password: 'SecurePass123!',
        organization: 'Test Org',
        acceptTerms: true,
      };

      return request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(registerDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('Email already registered');
        });
    });

    it('should reject duplicate handle', () => {
      const registerDto = {
        name: 'Another User',
        email: 'another@test.com',
        handle: 'e2euser', // Same handle
        password: 'SecurePass123!',
        organization: 'Test Org',
        acceptTerms: true,
      };

      return request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(registerDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('Handle already taken');
        });
    });

    it('should reject weak password', () => {
      const registerDto = {
        name: 'Test User',
        email: 'weak@test.com',
        handle: 'weakuser',
        password: 'weak', // Too weak
        organization: 'Test Org',
        acceptTerms: true,
      };

      return request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          name: 'Test User',
          // Missing email, handle, password
        })
        .expect(400);
    });
  });

  describe('/v1/auth/login (POST)', () => {
    it('should login successfully with correct credentials', () => {
      const loginDto = {
        email: 'e2e@test.com',
        password: 'SecurePass123!',
      };

      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('expiresIn');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('email', 'e2e@test.com');
          expect(res.body.user).toHaveProperty('roles');

          authToken = res.body.accessToken;
        });
    });

    it('should reject invalid email', () => {
      const loginDto = {
        email: 'nonexistent@test.com',
        password: 'SecurePass123!',
      };

      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid email or password');
        });
    });

    it('should reject invalid password', () => {
      const loginDto = {
        email: 'e2e@test.com',
        password: 'WrongPassword123!',
      };

      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid email or password');
        });
    });

    it('should handle case-insensitive email', () => {
      const loginDto = {
        email: 'E2E@TEST.COM', // Uppercase
        password: 'SecurePass123!',
      };

      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(200);
    });
  });

  describe('/v1/auth/me (GET)', () => {
    it('should get current user with valid token', () => {
      return request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'e2e@test.com');
          expect(res.body).toHaveProperty('name', 'E2E Test User');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/v1/auth/me')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/v1/users/me (GET)', () => {
    it('should get user profile with gamification data', () => {
      return request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'e2e@test.com');
          expect(res.body).toHaveProperty('gamificationProfile');
          expect(res.body.gamificationProfile).toHaveProperty('xp', 50); // Welcome XP
          expect(res.body.gamificationProfile).toHaveProperty('level', 1);
        });
    });
  });

  describe('/v1/users/me (PUT)', () => {
    it('should update user profile', () => {
      const updateDto = {
        name: 'Updated Name',
        bio: 'Updated bio',
        organization: 'Updated Org',
      };

      return request(app.getHttpServer())
        .put('/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Updated Name');
          expect(res.body).toHaveProperty('bio', 'Updated bio');
          expect(res.body).toHaveProperty('organization', 'Updated Org');
        });
    });

    it('should reject update without authentication', () => {
      return request(app.getHttpServer())
        .put('/v1/users/me')
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should complete register → login → get profile → update profile flow', async () => {
      // 1. Register new user
      const registerDto = {
        name: 'Flow Test User',
        email: 'flow@test.com',
        handle: 'flowuser',
        password: 'FlowTest123!',
        organization: 'Flow Test Org',
        acceptTerms: true,
      };

      const registerRes = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(registerDto)
        .expect(201);

      expect(registerRes.body).toHaveProperty('id');
      const flowUserId = registerRes.body.id;

      // 2. Login with new user
      const loginRes = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        })
        .expect(200);

      expect(loginRes.body).toHaveProperty('accessToken');
      const flowToken = loginRes.body.accessToken;

      // 3. Get profile
      const profileRes = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', `Bearer ${flowToken}`)
        .expect(200);

      expect(profileRes.body.id).toBe(flowUserId);
      expect(profileRes.body.email).toBe(registerDto.email);

      // 4. Update profile
      const updateRes = await request(app.getHttpServer())
        .put('/v1/users/me')
        .set('Authorization', `Bearer ${flowToken}`)
        .send({ bio: 'E2E flow test bio' })
        .expect(200);

      expect(updateRes.body.bio).toBe('E2E flow test bio');

      // 5. Verify update persisted
      const verifyRes = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', `Bearer ${flowToken}`)
        .expect(200);

      expect(verifyRes.body.bio).toBe('E2E flow test bio');
    });
  });
});

/**
 * Helper function to clean the database
 */
async function cleanDatabase(prisma: PrismaService) {
  // Delete in correct order due to foreign key constraints
  await prisma.auditLog.deleteMany();
  await prisma.xpEvent.deleteMany();
  await prisma.gamificationProfile.deleteMany();
  await prisma.user.deleteMany();
}
