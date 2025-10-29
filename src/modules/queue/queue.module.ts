import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QUEUE_NAMES } from './constants/queue.constants';
import { ColorGenerationProcessor } from './processors/color-generation.processor';
import { LogoGenerationProcessor } from './processors/logo-generation.processor';
import { WebsiteGenerationProcessor } from './processors/website-generation.processor';
import { MockupGenerationProcessor } from './processors/mockup-generation.processor';
import { AssetAggregationProcessor } from './processors/asset-aggregation.processor';
import { QueueService } from './services/queue.service';
import { AssetOrchestrationService } from './services/asset-orchestration.service';
import { AiModule } from '../ai/ai.module';
import { Brand, BrandSchema } from '../brand/schemas/brand.schema';
import { BrandAssets, BrandAssetsSchema } from '../brand/schemas/assets.schema';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.COLOR_GENERATION },
      { name: QUEUE_NAMES.LOGO_GENERATION },
      { name: QUEUE_NAMES.WEBSITE_GENERATION },
      { name: QUEUE_NAMES.MOCKUP_GENERATION },
      { name: QUEUE_NAMES.ASSET_AGGREGATION },
    ),
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: BrandAssets.name, schema: BrandAssetsSchema },
    ]),
    AiModule,
  ],
  providers: [
    ColorGenerationProcessor,
    LogoGenerationProcessor,
    WebsiteGenerationProcessor,
    MockupGenerationProcessor,
    AssetAggregationProcessor,
    QueueService,
    AssetOrchestrationService,
  ],
  exports: [QueueService, AssetOrchestrationService],
})
export class QueueModule {}