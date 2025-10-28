import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkController } from './clerk.controller';
import { ClerkService } from './clerk.service';

@Module({
  imports: [ConfigModule],
  controllers: [ClerkController],
  providers: [ClerkService],
})
export class ClerkModule {}
