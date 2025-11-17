import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiService } from 'src/modules/ai/ai.service';
import { BrandAssets } from 'src/schemas/assets.schema';
import { Brand } from 'src/schemas/brand.schema';
import { WebsiteTemplateService } from 'src/modules/website/services/website-template.service';
import { JobResult } from '../../interfaces/job-data.interface';
import { REGENERATE_QUEUE_NAMES } from '../../constants/regenerate-queue.constants';

interface RegenerationJobData {
  brandId: Types.ObjectId;
  brand: Brand;
}

@Processor(REGENERATE_QUEUE_NAMES.WEBSITE_REGENERATE, { concurrency: 2 })
export class WebsiteRegenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(WebsiteRegenerationProcessor.name);

  constructor(
    private readonly aiService: AiService,
    @InjectModel(BrandAssets.name)
    private readonly assetsModel: Model<BrandAssets>,
    @InjectModel(Brand.name)
    private readonly brandModel: Model<Brand>,
    private readonly webTemplateService: WebsiteTemplateService,
  ) {
    super();
  }

  async process(job: Job<RegenerationJobData>): Promise<JobResult> {
    const { brandId, brand } = job.data;
    const brandObjectId = new Types.ObjectId(brandId);
    this.logger.log(`🌐 [${brandId}] Starting Website Regeneration Job...`);

    try {

      // STEP 2️⃣ — Fetch BrandAssets from Mongo
      const brandAssets = await this.assetsModel.findOne({ brand: brandObjectId });
      if (!brandAssets) {
        throw new Error(`No BrandAssets found for brand ${brandId}`);
      }
      const { industry, businessName, tagline, typeOfWebsite } = brand;
      const vision = brandAssets?.vision;
      const mission = brandAssets?.mission;
      const logoUrl = brandAssets?.logos?.find((l) => l.type === 'icon')?.url;

      // STEP 3️⃣ — Generate website JSON using AI
      const websiteJson = await this.webTemplateService.buildWebsite(
        {
          businessName,
          industry,
          tagline,
          vision,
          mission,
          logoUrl,
          typeOfWebsite,
          existingTemplate: brand.template
        }
        // colorScheme,
      );


      // // STEP 3️⃣ — Generate website JSON using AI
      // const websiteJson = await this.webTemplateService.buildWebsite(
      //   this.sampleData.businessName,
      //   this.sampleData.industry,
      //   this.sampleData.tagline,
      //   this.sampleData.vision,
      //   this.sampleData.mission,
      //   this.sampleData.logoUrl,
      //   this.sampleData.typeOfWebsite,
      //   this.sampleData.colorScheme
      // );

      if (!websiteJson) {
        throw new Error(
          `Website regeneration failed: 'Unknown AI error.'}`,
        );
      }

      // STEP 4️⃣ — Save generated data
      const prevWebsite = brandAssets?.website;
      const assetsUpdate: any = {
        $set: {
          website: websiteJson,
          updatedAt: new Date(),
        },
      };
      if (prevWebsite !== undefined && prevWebsite !== null) {
        // store previous snapshot into websiteHistory
        assetsUpdate.$push = { websiteHistory: prevWebsite };
      }

      await Promise.all([
        this.assetsModel.findOneAndUpdate(
          { brand: brandObjectId },
          assetsUpdate,
          { upsert: true, new: true },
        ),
        this.brandModel.findOneAndUpdate(
          { _id: brandObjectId },
          {
            $set: {
              template: websiteJson.websiteTemplate,
              updatedAt: new Date(),
            },
          },
          { upsert: true, new: true },
        ),
      ]);

      this.logger.log(`💾 [${brandId}] Website successfully regenerated and saved.`);
      return { success: true, brandId, data: { website: websiteJson } };
    } catch (error) {
      this.logger.error(`❌ [${brandId}] Website generation failed: ${error.message}`);
      throw error;
    }
  }
}
