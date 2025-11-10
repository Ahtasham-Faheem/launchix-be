import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiService } from 'src/modules/ai/ai.service';
import { BrandAssets } from 'src/schemas/assets.schema';
import { Brand } from 'src/schemas/brand.schema';
import { QUEUE_NAMES } from 'src/modules/queue/constants/queue.constants';

interface RegenerationJobData {
  brandId: string;
  prompt: string;
}

@Processor(QUEUE_NAMES.WEBSITE_REGENERATION, { concurrency: 2 })
export class WebsiteRegenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(WebsiteRegenerationProcessor.name);

  constructor(
    private readonly aiService: AiService,
    @InjectModel(BrandAssets.name)
    private readonly assetsModel: Model<BrandAssets>,
    @InjectModel(Brand.name)
    private readonly brandModel: Model<Brand>,
  ) {
    super();
  }

  async process(job: Job<RegenerationJobData>) {
    const { brandId, prompt } = job.data;
    this.logger.log(`♻️ [${brandId}] Regenerating website with new prompt...`);

    const brandObjectId = new Types.ObjectId(brandId);
    const brandAssets = await this.assetsModel.findOne({ brand: brandObjectId });

    if (!brandAssets?.website?.grapesjs)
      throw new Error('Website data missing for regeneration');

    const { html, css } = brandAssets.website.grapesjs;

    // Call AI service to update HTML/CSS
    const updated = await this.aiService.updateWebsite(prompt, html, css);
    // Update MongoDB
    await this.assetsModel.findOneAndUpdate(
      { brand: brandObjectId },
      {
        $set: {
          'website.grapesjs.html': updated.html,
          'website.grapesjs.css': updated.css,
          'website.metadata.lastRegenerationPrompt': prompt,
          updatedAt: new Date(),
        },
      },
      { new: true },
    );

    this.logger.log(`✅ [${brandId}] Website regenerated successfully.`);
    return { success: true, brandId };
  }
}
