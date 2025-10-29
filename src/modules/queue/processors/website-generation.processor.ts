import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../constants/queue.constants';
import { WebsiteGenerationJobData, JobResult } from '../interfaces/job-data.interface';
import { AiService } from '../../ai/ai.service';

@Processor(QUEUE_NAMES.WEBSITE_GENERATION, {
  concurrency: 5,
})
export class WebsiteGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(WebsiteGenerationProcessor.name);

  constructor(private readonly aiService: AiService) {
    super();
  }

  async process(job: Job<WebsiteGenerationJobData>): Promise<JobResult> {
    const { brandId, businessName, tagline, industry, colors } = job.data;

    this.logger.log(`Generating website JSON for brand: ${brandId}`);

    try {
      const context = { businessName, tagline, industry };
      const websiteJson = await this.aiService.generateWebsiteJson(context, colors);

      this.logger.log(`Successfully generated website JSON for brand: ${brandId}`);

      return {
        success: true,
        data: { websiteJson },
        brandId,
      };
    } catch (error) {
      this.logger.error(`Website generation failed for brand ${brandId}:`, error.message);
      throw error;
    }
  }
}