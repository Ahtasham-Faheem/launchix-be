import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../constants/queue.constants';
import { ColorGenerationJobData, JobResult } from '../interfaces/job-data.interface';
import { AiService } from '../../ai/ai.service';

@Processor(QUEUE_NAMES.IDENTITY_GENERATION, {
  concurrency: 10, // Higher concurrency for lightweight operations
})
export class IdentityGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(IdentityGenerationProcessor.name);

  constructor(private readonly aiService: AiService) {
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

      this.logger.log(`Generated identity for brand: ${brandId}`);

      return {
        success: true,
        data: { brandIdentity },
        brandId,
      };
    } catch (error) {
      this.logger.error(`Color generation failed for brand ${brandId}:`, error.message);
      throw error;
    }
  }
}