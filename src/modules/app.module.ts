import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { QueueConfigModule } from './config/queue-config.module';
import { BrandModule } from './brand/brand.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { HealthModule } from './health/health.module';
import { ProfileModule } from './profile/profile.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    LoggerModule.forRoot({
      pinoHttp: {
        // transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        // level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        quietReqLogger: true, // stops request spam
        level: 'error',  
      },
    }),
    
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
        limit: parseInt(process.env.RATE_LIMIT_LIMIT || '120', 10),
      },
    ]),
    
    MongooseModule.forRoot(process.env.MONGODB_URI),
    
    // Queue configuration (Redis + BullMQ)
    QueueConfigModule,
    
    // Application modules
    ProfileModule,
    AuthModule,
    BrandModule,
    AiModule,
    QueueModule,
    UploadModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}