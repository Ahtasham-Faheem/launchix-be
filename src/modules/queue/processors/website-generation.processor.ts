import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Types, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { QUEUE_NAMES } from '../constants/queue.constants';
import { WebsiteGenerationJobData, JobResult } from '../interfaces/job-data.interface';
import { AiService } from '../../ai/ai.service';
import { BrandAssets } from 'src/schemas/assets.schema';
import { QueueService } from '../services/queue.service';
import { WebsiteTemplateService } from 'src/modules/website/website-template.service';

@Processor(QUEUE_NAMES.WEBSITE_GENERATION, { concurrency: 3 })
export class WebsiteGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(WebsiteGenerationProcessor.name);

  constructor(
    private readonly aiService: AiService,
    private readonly webTemplateService: WebsiteTemplateService,
    @InjectModel(BrandAssets.name)
    private readonly assetsModel: Model<BrandAssets>,
    private readonly queueService: QueueService,
  ) {
    super();
  }

   sampleData = { "businessName": "AquaLift Pumps", "industry": "Water Pump Manufacturing", "tagline": "Powering Your Water Solutions", "vision": "To be the leading provider of innovative water pumping solutions, empowering communities with sustainable and efficient water management systems.", "mission": "We manufacture high-quality water pumps that enhance efficiency and reliability, ensuring optimal water solutions for every need.", "logoUrl": "https://res.cloudinary.com/dudpoehph/image/upload/v1762169569/launchix_ai_logos/jaonuioucodeni4jfo8o.png", "colorScheme": { "primary": "#0077B3", "secondary": "#00A3E0", "accent": "#0095D9", "background": "#E7F6FF", "text": "#002B36" } }

  private buildColorScheme(colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  }) {
    if (
      !colors ||
      !colors.primary ||
      !colors.secondary ||
      !colors.accent ||
      !colors.background ||
      !colors.text
    ) {
      return undefined;
    }

    return {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      text: colors.text,
    };
  }


  async process(job: Job<WebsiteGenerationJobData>): Promise<JobResult> {
    const { brandId, businessName, tagline, industry, brandStyle } = job.data;
    const brandObjectId = new Types.ObjectId(brandId);
    this.logger.log(`🌐 [${brandId}] Starting Website Generation Job...`);

    try {
      // STEP 1️⃣ — Wait for dependencies (identity + logo) to complete
      const dependenciesReady = await this.waitForDependencies(brandId.toString(), 30, 5000); // 30 attempts, 5s interval
      if (!dependenciesReady) {
        this.logger.warn(
          `⚠️ [${brandId}] Identity/Logo generation still pending after timeout. Job delayed.`,
        );

        // Requeue after 2 minutes
        await job.moveToDelayed(Date.now() + 1000 * 60 * 2);
        return { success: false, brandId, data: { reason: 'Dependencies not ready (delayed).' } };
      }

      this.logger.log(`✅ [${brandId}] All dependencies ready. Proceeding with website generation.`);

      // STEP 2️⃣ — Fetch BrandAssets from Mongo
      const brandAssets = await this.assetsModel.findOne({ brand: brandObjectId });
      if (!brandAssets) {
        throw new Error(`No BrandAssets found for brand ${brandId}`);
      }

      const vision =
        brandAssets?.vision ||
        `To be a leading name in ${industry}, shaping innovation and trust.`;
      const mission =
        brandAssets?.mission ||
        `Deliver reliable and transformative ${industry} experiences that empower people.`;
      const logoUrl =
        brandAssets?.logos?.find((l) => l.type === 'icon')?.url ||
        'https://via.placeholder.com/200x60/4F46E5/FFFFFF?text=YourBrand';

      const [
        primary,
        secondary,
        accent,
        background,
        text
      ] = brandAssets.palette || []

      let colorScheme = this.buildColorScheme({
        primary,
        secondary,
        accent,
        background,
        text
      })

      // STEP 3️⃣ — Generate website JSON using AI
      const websiteJson = await this.webTemplateService.buildWebsite(
        businessName,
        industry,
        tagline,
        vision,
        mission,
        logoUrl,
        colorScheme
      );
     
     
      // // STEP 3️⃣ — Generate website JSON using AI
      // const websiteJson = await this.webTemplateService.buildWebsite(
      //   this.sampleData.businessName,
      //   this.sampleData.industry,
      //   this.sampleData.tagline,
      //   this.sampleData.vision,
      //   this.sampleData.mission,
      //   this.sampleData.logoUrl,
      //   this.sampleData.colorScheme
      // );

      if (!websiteJson) {
        throw new Error(
          `Website generation failed: 'Unknown AI error.'}`,
        );
      }

      // STEP 4️⃣ — Save generated data
      await this.assetsModel.findOneAndUpdate(
        { brand: brandObjectId },
        {
          $set: {
            website: websiteJson,
            updatedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      );

      this.logger.log(`💾 [${brandId}] Website successfully generated and saved.`);
      return { success: true, brandId, data: { website: websiteJson } };
    } catch (error) {
      this.logger.error(`❌ [${brandId}] Website generation failed: ${error.message}`);
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

      const identityJobs = jobStatuses.filter((j) => j.id.startsWith('identity'));
      const logoJobs = jobStatuses.filter((j) => j.id.startsWith('logo'));

      const identityCompleted = identityJobs.every((j) => j.state === 'completed');
      const logoCompleted = logoJobs.every((j) => j.state === 'completed');

      if (identityCompleted && logoCompleted) return true;

      this.logger.log(
        `⏳ [${brandId}] Waiting for dependencies... (Attempt ${attempt}/${maxAttempts}) | identity: ${identityCompleted}, logo: ${logoCompleted}`,
      );

      await this.sleep(intervalMs);
    }

    return false;
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
