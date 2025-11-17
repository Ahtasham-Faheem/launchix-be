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
import { Brand, BrandSchema } from '../../schemas/brand.schema';
import { BrandAssets, BrandAssetsSchema } from '../../schemas/assets.schema';
import { ImageOverlayService } from '../imageOverlay/imageOverlay.service';
import { WebsiteTemplateService } from '../website/services/website-template.service';
import { WebsiteRegenerationProcessor } from './processors/regenerate/regeneration-website.processor';
import { REGENERATE_QUEUE_NAMES } from './constants/regenerate-queue.constants';
import { BannerGenerationProcessor } from './processors/banner-generation.processor';
import { RegenerateQueueService } from './services/regenerate-queue.service';
import { ColorPalleteReGenerationProcessor } from './processors/regenerate/regeneration-color-pallete.processor';
import { LogoRegenerationProcessor } from './processors/regenerate/regeneration-logo.processor';
import { BannerRegenerationProcessor } from './processors/regenerate/regeneration-banner.processor';


@Module({
  imports: [
    EventEmitterModule.forRoot(),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.IDENTITY_GENERATION },
      { name: QUEUE_NAMES.LOGO_GENERATION },
      { name: QUEUE_NAMES.WEBSITE_GENERATION },
      { name: QUEUE_NAMES.MOCKUP_GENERATION },
      { name: QUEUE_NAMES.ASSET_AGGREGATION },
      { name: QUEUE_NAMES.BANNER_GENERATION },

      /* REGENERATION QUEUE */ 
      { name: REGENERATE_QUEUE_NAMES.WEBSITE_REGENERATE},
      { name: REGENERATE_QUEUE_NAMES.LOGO_REGENERATE},
      { name: REGENERATE_QUEUE_NAMES.TYPOGRAPHY_REGENERATE},
      { name: REGENERATE_QUEUE_NAMES.COLOR_PALETTE_REGENERATE},
      { name: REGENERATE_QUEUE_NAMES.MISSION_REGENERATE},
      { name: REGENERATE_QUEUE_NAMES.VISION_REGENERATE},
      { name: REGENERATE_QUEUE_NAMES.BANNER_REGENERATE},

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
    BannerGenerationProcessor,
    
    // Regenerate Processor
    ColorPalleteReGenerationProcessor,
    WebsiteRegenerationProcessor,
    LogoRegenerationProcessor,
    BannerRegenerationProcessor,

    QueueService,
    RegenerateQueueService,
    AssetOrchestrationService,
    ImageOverlayService,
    WebsiteTemplateService
  ],
  exports: [QueueService, AssetOrchestrationService, RegenerateQueueService],
})
export class QueueModule {}