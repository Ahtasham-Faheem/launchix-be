import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../constants/queue.constants';
import { ColorGenerationJobData, JobResult } from '../interfaces/job-data.interface';
import { AiService } from '../../ai/ai.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BrandAssets } from 'src/modules/brand/schemas/assets.schema';
import { BrandIdentity } from 'src/modules/brand/interfaces/brand-identity.interface';

@Processor(QUEUE_NAMES.IDENTITY_GENERATION, {
  concurrency: 10, // Higher concurrency for lightweight operations
})
export class IdentityGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(IdentityGenerationProcessor.name);

  constructor(private readonly aiService: AiService,
    @InjectModel(BrandAssets.name)
    private readonly assetsModel: Model<BrandAssets>,
  ) {
    super();
  }

  async process(job: Job<ColorGenerationJobData>): Promise<JobResult> {
    // const { brandId, brandStyles } = job.data;
    const { brandId, businessName, tagline, industry, brandStyles } = job.data;

    this.logger.log(`Processing color generation for brand: ${brandId}`);
    try {
      // const palette = this.aiService.pickColors(brandStyles);
      const brandIdentity = await this.aiService.generateBrandIdentity(
        businessName,
        industry,
        tagline,
        brandStyles,
      );

      const brandObjectId = new Types.ObjectId(brandId);

      if (!brandIdentity || ('errors' in brandIdentity && brandIdentity.errors.length > 0)) {
        const errors = !brandIdentity ? ['no_result_from_ai'] : brandIdentity.errors;
        this.logger.error(`AI returned errors for brand ${brandId}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
        return {
          success: false,
          data: { errors },
          brandId: brandObjectId,
        };
      }


      // ✅ Save the generated identity in BrandAssets
      // At this point brandIdentity is narrowed to the success shape (no 'errors' key).
      const identity = brandIdentity as BrandIdentity;
      
      await this.assetsModel.findOneAndUpdate(
        { brand: brandObjectId },
        {
          $set: {
            brand: brandObjectId,
            vision: identity.vision,
            mission: identity.mission,
            palette: identity.palette,
            typography: identity.typography,
            updatedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      );

      this.logger.log(`✅ Brand identity saved for brand ${brandId}`);

      return {
        success: true,
        data: { ...brandIdentity },
        brandId,
      };
    } catch (error) {
      this.logger.error(`Color generation failed for brand ${brandId}:`, error.message);
      throw error;
    }
  }
}