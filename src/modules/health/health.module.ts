import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { QUEUE_NAMES } from '../queue/constants/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.COLOR_GENERATION },
      { name: QUEUE_NAMES.LOGO_GENERATION },
      { name: QUEUE_NAMES.WEBSITE_GENERATION },
      { name: QUEUE_NAMES.MOCKUP_GENERATION },
      { name: QUEUE_NAMES.ASSET_AGGREGATION },
    ),
  ],
  controllers: [HealthController],
})
export class HealthModule {}