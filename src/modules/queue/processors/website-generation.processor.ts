import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../constants/queue.constants';
import { WebsiteGenerationJobData, JobResult } from '../interfaces/job-data.interface';
import { AiService } from '../../ai/ai.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BrandAssets } from 'src/modules/brand/schemas/assets.schema';

@Processor(QUEUE_NAMES.WEBSITE_GENERATION, {
  concurrency: 5,
})
export class WebsiteGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(WebsiteGenerationProcessor.name);

  constructor(private readonly aiService: AiService,
    @InjectModel(BrandAssets.name)
    private readonly assetsModel: Model<BrandAssets>,
  ) {
    super();
  }

  async process(job: Job<WebsiteGenerationJobData>): Promise<JobResult> {
    const { brandId, businessName, tagline, industry, brandStyle } = job.data;

    this.logger.log(`Generating website JSON for brand: ${brandId}`);

    try {


      const vision = `To be the leading provider of innovative solutions in the ${industry} industry, empowering businesses to achieve their full potential through cutting-edge technology and exceptional service.`;
      const mission = `Our mission is to deliver high-quality, reliable, and user-friendly products that address the unique challenges faced by businesses in the ${industry} sector. We are committed to fostering long-term partnerships with our clients by providing exceptional customer support and continuously evolving our offerings to meet their changing needs.`;
      const logoUrl = 'https://img.freepik.com/free-vector/squares-logo_1017-8755.jpg?semt=ais_hybrid&w=740&q=80'
      const websiteJson = await this.aiService.generatePremiumWebsite(businessName, industry, tagline, vision, mission);

      const brandObjectId = new Types.ObjectId(brandId);

      this.assetsModel.findOneAndUpdate(
        { brand: brandObjectId },
        {
          $set: {
            brand: brandObjectId,
            websit: websiteJson,
            updatedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      ).then(() => {
        this.logger.log(`Website JSON saved to assets for brand: ${brandId}`);
      }).catch((err) => {
        this.logger.error(`Failed to save website JSON for brand: ${brandId}`, err);
      });

      this.logger.log(`Successfully generated website JSON for brand: ${brandId}`);

      return {
        success: true,
        data: { website: websiteJson },
        brandId,
      };
    } catch (error) {
      console.log('Error generating website JSON:', error);
      this.logger.error(`Website generation failed for brand ${brandId}:`, error.message);
      throw error;
    }
  }
}