import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../constants/queue.constants';
import { MockupGenerationJobData, JobResult } from '../interfaces/job-data.interface';
import { AiService } from '../../ai/ai.service';

@Processor(QUEUE_NAMES.MOCKUP_GENERATION, {
  concurrency: 8,
})
export class MockupGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(MockupGenerationProcessor.name);

  constructor(private readonly aiService: AiService) {
    super();
  }

  async process(job: Job<MockupGenerationJobData>): Promise<JobResult> {
    const { brandId } = job.data;

    this.logger.log(`Generating mockups for brand: ${brandId}`);

    try {
      const mockups = await this.aiService.createMockups();

      this.logger.log(`Successfully generated ${mockups.length} mockups for brand: ${brandId}`);

      return {
        success: true,
        data: { mockups },
        brandId,
      };
    } catch (error) {
      this.logger.error(`Mockup generation failed for brand ${brandId}:`, error.message);
      throw error;
    }
  }
}