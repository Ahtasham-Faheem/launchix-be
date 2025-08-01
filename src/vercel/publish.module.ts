// publish.module.ts
import { Module } from '@nestjs/common';
import { PublishController } from './publish.controller';
import { VercelService } from './vercel.service';

@Module({
  controllers: [PublishController],
  providers: [VercelService],
})
export class PublishModule {}
