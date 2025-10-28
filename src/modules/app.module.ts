import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BrandModule } from './brand/brand.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { HealthModule } from './health/health.module';
import { APP_GUARD } from '@nestjs/core';
import { ClerkModule } from './clerk/clerk.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'),
      limit: parseInt(process.env.RATE_LIMIT_LIMIT || '120'),
    }]),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    
    ProfileModule,
    ClerkModule,
    AuthModule,
    BrandModule,
    AiModule,
    UploadModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }
