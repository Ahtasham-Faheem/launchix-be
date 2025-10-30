import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QUEUE_NAMES } from './constants/queue.constants';
import { IdentityGenerationProcessor } from './processors/identity-generation.processor';
import { LogoGenerationProcessor } from './processors/logo-generation.processor';
import { WebsiteGenerationProcessor } from './processors/website-generation.processor';
import { MockupGenerationProcessor } from './processors/mockup-generation.processor';
import { AssetAggregationProcessor } from './processors/asset-aggregation.processor';
import { QueueService } from './services/queue.service';
import { AssetOrchestrationService } from './services/asset-orchestration.service';
import { AiModule } from '../ai/ai.module';
import { Brand, BrandSchema } from '../brand/schemas/brand.schema';
import { BrandAssets, BrandAssetsSchema } from '../brand/schemas/assets.schema';
import { ImageOverlayService } from '../printify/printify.service';
import { WebsiteTemplateService } from '../website/website-template.service';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.IDENTITY_GENERATION },
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
    IdentityGenerationProcessor,
    LogoGenerationProcessor,
    WebsiteGenerationProcessor,
    MockupGenerationProcessor,
    AssetAggregationProcessor,
    QueueService,
    AssetOrchestrationService,
    ImageOverlayService,
    WebsiteTemplateService
  ],
  exports: [QueueService, AssetOrchestrationService],
})
export class QueueModule {}