import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QUEUE_NAMES } from '../constants/queue.constants';
import { MockupGenerationJobData, JobResult } from '../interfaces/job-data.interface';

import { BrandAssets } from 'src/modules/brand/schemas/assets.schema';
import { QueueService } from '../services/queue.service';
import { ImageOverlayService } from 'src/modules/imageOverlay/imageOverlay.service';

@Processor(QUEUE_NAMES.MOCKUP_GENERATION, { concurrency: 5 })
export class MockupGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(MockupGenerationProcessor.name);

  constructor(
    private readonly printify: ImageOverlayService,
    private readonly queueService: QueueService,
    @InjectModel(BrandAssets.name)
    private readonly assetsModel: Model<BrandAssets>,
  ) {
    super();
  }

  async process(job: Job<MockupGenerationJobData>): Promise<JobResult> {
    const { brandId } = job.data;
    const brandObjectId = new Types.ObjectId(brandId);

    this.logger.log(`🧩 Starting Printify mockup generation for brand: ${brandId}`);

    try {
      // 1️⃣ Wait until logo jobs are completed
      await this.waitForDependencies(brandId.toString(), 30, 5000); // 30 attempts, 5s interval

      // 2️⃣ Get logo URLs from BrandAssets
      const brandAssets = await this.assetsModel.findOne({ brand: brandObjectId });
      if (!brandAssets?.logos?.length) {
        throw new Error('No logos found in BrandAssets.');
      }

      const primaryLogo =
        brandAssets.logos.find((l) => l.type === 'primary')?.url ||
        brandAssets.logos[0]?.url;

      // const primaryLogo = 'https://img.freepik.com/free-vector/gradient-logo-with-abstract-shape_23-2148216799.jpg';

      if (!primaryLogo) throw new Error('No primary logo URL available.');

      const { publicId, imageUrl } = await this.printify.overlayImageOnShirt(primaryLogo);

      console.log('Generated mockup publicId:', { publicId, imageUrl });

      await this.assetsModel.findOneAndUpdate(
        { brand: brandObjectId },
        {
          $set: { brand: brandObjectId, updatedAt: new Date() },
          $push: { mockups: imageUrl },
        },
        { upsert: true, new: true }
      );

      this.logger.log(`💾 [${brandId}] Saved  mockup sets successfully.`);

      return { success: true, brandId, data: { mockups: [imageUrl] } };
    } catch (error) {
      console.log('Mockup generation failed', error.response?.data || error.message);
      this.logger.error(`❌ [${brandId}] Mockup generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
    * Waits until all dependency jobs (identity*, logo*) are completed.
    * @param brandId The brand ID for which to check statuses.
    * @param maxAttempts Number of attempts before timeout.
    * @param intervalMs Delay between each poll.
    * @returns boolean
    */
  private async waitForDependencies(
    brandId: string,
    maxAttempts = 30,
    intervalMs = 5000,
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const statuses = await this.queueService.getBrandJobStatuses(brandId);
      if (!statuses) {
        this.logger.warn(`⚙️ [${brandId}] No queue statuses found (attempt ${attempt}/${maxAttempts}).`);
        await this.sleep(intervalMs);
        continue;
      }

      const jobStatuses = Object.values(statuses) as any[];


      const logoJobs = jobStatuses.filter((j) => j.id.startsWith('logo'));
      const logoCompleted = logoJobs.every((j) => j.state === 'completed');

      if (logoCompleted) return true;

      this.logger.log(
        `⏳ [${brandId}] Waiting for dependencies... (Attempt ${attempt}/${maxAttempts}), logo: ${logoCompleted}`,
      );

      await this.sleep(intervalMs);
    }

    return false;
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
