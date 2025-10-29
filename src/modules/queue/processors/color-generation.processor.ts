import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../constants/queue.constants';
import { ColorGenerationJobData, JobResult } from '../interfaces/job-data.interface';
import { AiService } from '../../ai/ai.service';

@Processor(QUEUE_NAMES.COLOR_GENERATION, {
  concurrency: 10, // Higher concurrency for lightweight operations
})
export class ColorGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(ColorGenerationProcessor.name);

  constructor(private readonly aiService: AiService) {
    super();
  }

  async process(job: Job<ColorGenerationJobData>): Promise<JobResult> {
    const { brandId, brandStyles } = job.data;

    this.logger.log(`Processing color generation for brand: ${brandId}`);

    try {
      const palette = this.aiService.pickColors(brandStyles);

      this.logger.log(`Generated ${palette.length} colors for brand: ${brandId}`);

      return {
        success: true,
        data: { palette },
        brandId,
      };
    } catch (error) {
      this.logger.error(`Color generation failed for brand ${brandId}:`, error.message);
      throw error;
    }
  }
}