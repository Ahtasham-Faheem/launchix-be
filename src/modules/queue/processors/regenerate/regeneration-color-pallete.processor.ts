import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';


import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BrandAssets } from 'src/schemas/assets.schema';
import { BrandIdentity } from 'src/modules/brand/interfaces/brand-identity.interface';
import { REGENERATE_QUEUE_NAMES } from '../../constants/regenerate-queue.constants';
import { RegenAiService } from 'src/modules/ai/regen-ai.service';
import { ColorGenerationJobData, JobResult } from '../../interfaces/job-data.interface';


@Processor(REGENERATE_QUEUE_NAMES.COLOR_PALETTE_REGENERATE, {
  concurrency: 10, // Higher concurrency for lightweight operations
})
export class ColorPalleteReGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(ColorPalleteReGenerationProcessor.name);

  constructor(private readonly aiService: RegenAiService,
    @InjectModel(BrandAssets.name)
    private readonly assetsModel: Model<BrandAssets>,
  ) {
    super();
  }

  async process(job: Job<ColorGenerationJobData>): Promise<JobResult> {
    // const { brandId, brandStyles } = job.data;
    const { brandId, businessName, tagline, industry, brandStyles, typeOfWebsite } = job.data;

    this.logger.log(`Processing color generation for brand: ${brandId}`);
    try {
      // const palette = this.aiService.pickColors(brandStyles);
      const generatedColor = await this.aiService.generateColorPalette(
        businessName,
        industry,
        tagline,
        brandStyles,
        typeOfWebsite,
      );

      const brandObjectId = new Types.ObjectId(brandId);

      if (!generatedColor || ('errors' in generatedColor && generatedColor.errors.length > 0)) {
        const errors = !generatedColor ? ['no_result_from_ai'] : generatedColor.errors;
        this.logger.error(`AI returned errors for brand ${brandId}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
        return {
          success: false,
          data: { errors },
          brandId: brandObjectId,
        };
      }

      // read existing document to capture previous palette snapshot
      const existing = await this.assetsModel.findOne({ brand: brandObjectId }).lean();
      const prevPalette = Array.isArray(existing?.palette) && existing.palette.length ? existing.palette : null;
      const newPalette = Array.isArray(generatedColor.data) ? generatedColor.data : [];

      const update: any = {
        $set: {
          palette: newPalette,
          updatedAt: new Date(),
        },
      };

      // push previous palette snapshot into paletteHistory if present
      if (prevPalette) {
        update.$push = { paletteHistory: prevPalette };
      }

      const updatedColor = await this.assetsModel.findOneAndUpdate(
        { brand: brandObjectId },
        update,
        { upsert: true, new: true },
      );

      this.logger.log(`✅ Brand identity saved for brand ${brandId}`);

      return {
        success: true,
        data: { palette: updatedColor.palette },
        brandId,
      };
    } catch (error) {
      this.logger.error(`Color generation failed for brand ${brandId}:`, error.message);
      throw error;
    }
  }
}