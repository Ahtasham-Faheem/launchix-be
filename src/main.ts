import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // ─────────────────────────────
  // ✅ ConfigService Injection
  // ─────────────────────────────
  const configService = app.get(ConfigService);

  // ─────────────────────────────
  // ✅ Raw Body for Stripe Webhooks (BEFORE other middleware)
  // ─────────────────────────────
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.use(
    '/api/v1/stripe/webhook',
    express.raw({ type: 'application/json' }),
    (req: any, res: any, next: any) => {
      req.rawBody = req.body;
      next();
    },
  );

  expressApp.use(express.json());
  // ─────────────────────────────
  // ✅ Security Middleware
  // ─────────────────────────────
  app.use(helmet());

  // Enable CORS with values from environment
  const corsOrigins = configService.get<string>('CORS_ORIGIN');
  const origins = corsOrigins
    ? corsOrigins.split(',').map((o) => o.trim())
    : true;
  app.enableCors({
    origin: origins,
    credentials: true,
  });

  // app.use(clerkAuth, attachUser); // Apply globally
  // ─────────────────────────────
  // ✅ Global Settings
  // ─────────────────────────────
  app.setGlobalPrefix('api/v1', {
    exclude: ['/healthz'], // optional — keeps /healthz public
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  // ─────────────────────────────
  // ✅ Swagger Configuration
  // ─────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Launchix AI')
    .setDescription('Brand generation APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // ─────────────────────────────
  // ✅ Start Server
  // ─────────────────────────────
  const port = configService.get<number>('PORT') || 4242;
  await app.listen(port);

  console.log('─────────────────────────────');
  console.log(`🚀 Launchix AI API is running`);
  console.log(`📍 Base URL: http://localhost:${port}/api/v1`);
  console.log(`📘 Swagger Docs: http://localhost:${port}/docs`);
  console.log('─────────────────────────────');
}
bootstrap();
