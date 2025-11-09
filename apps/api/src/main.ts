import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Pino logger
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 4000);
  const isDevelopment = configService.get('NODE_ENV') !== 'production';

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: !isDevelopment,
      crossOriginOpenerPolicy: !isDevelopment,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS
  app.enableCors({
    origin: isDevelopment
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : configService.get<string>('CORS_ORIGINS', '').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  app.setGlobalPrefix('v1', {
    exclude: ['health', 'metrics'],
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger/OpenAPI documentation
  if (isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('Innovation Lab API')
      .setDescription(
        'API for Innovation Lab - Virtual Hackathons & Challenges Platform'
      )
      .setVersion('1.0')
      .setContact(
        'Innovation Lab Team',
        'https://innovationlab.example.com',
        'api@innovationlab.example.com'
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
          in: 'header',
        },
        'JWT'
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for service-to-service authentication',
        },
        'API-Key'
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('hackathons', 'Hackathon operations')
      .addTag('teams', 'Team management')
      .addTag('submissions', 'Submission handling')
      .addTag('challenges', 'Challenge operations')
      .addTag('gamification', 'XP, badges, and leaderboards')
      .addTag('files', 'File upload and management')
      .addTag('admin', 'Administration endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);

  console.log(`🚀 API Server running on: http://localhost:${port}/v1`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`📊 Metrics: http://localhost:${port}/metrics`);
}

bootstrap();
