import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../constants/queue.constants';
import { LogoGenerationJobData, JobResult } from '../interfaces/job-data.interface';
import { AiService } from '../../ai/ai.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BrandAssets } from 'src/modules/brand/schemas/assets.schema';

@Processor(QUEUE_NAMES.LOGO_GENERATION, {
  concurrency: 3, // Lower concurrency due to DALL-E rate limits
  limiter: {
    max: 10, // Max 10 jobs per duration
    duration: 60000, // 1 minute
  },
})
export class LogoGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(LogoGenerationProcessor.name);

  constructor(private readonly aiService: AiService,
    @InjectModel(BrandAssets.name)
    private readonly assetsModel: Model<BrandAssets>,
  ) {
    super();
  }

  async process(job: Job<LogoGenerationJobData>): Promise<JobResult> {
    const { brandId, brandName, tagline, brandStyles, colors, variant } = job.data;

    this.logger.log(`Generating ${variant} logo for brand: ${brandId}`);

    try {
      const prompt = this.buildLogoPrompt(brandName, tagline, brandStyles, colors, variant);

      const logos = await this.aiService.generateSingleLogo(prompt, variant);

      const brandObjectId = new Types.ObjectId(brandId);

      await this.assetsModel.findOneAndUpdate(
        { brand: brandObjectId },
        {
          $set: { brand: brandObjectId, updatedAt: new Date() },
          $push: { logos },
        },
        { upsert: true, new: true },
      );


      this.logger.log(`Successfully generated ${variant} logo for brand: ${brandId}`);

      return {
        success: true,
        data: { logos },
        brandId,
      };
    } catch (error) {
      this.logger.error(`Logo generation failed for brand ${brandId}:`, error.message);

      // Check if it's a rate limit error
      if (error.message?.includes('rate_limit')) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      throw error;
    }
  }

  private buildLogoPrompt(
    brandName: string,
    tagline: string | undefined,
    brandStyles: string[],
    colors: string[],
    variant: string,
  ): string {
    const taglineText = tagline ? ` — tagline: "${tagline}"` : '';
    const styles = brandStyles.join(', ');
    const [primary, secondary, background, accent] = colors;

    const prompts = {
      primary: `Design a **primary brand logo** for "${brandName}"${taglineText}. 
        It should combine an icon or abstract mark with the brand text in a balanced layout. 
        Style: ${styles}. 
        Use ${primary} as the main color and ${secondary} as an accent. 
        Keep it professional, vector-based, and suitable for both digital and print.`,

      secondary: `Create a **secondary simplified logo** for "${brandName}"${taglineText}. 
        This should be a flexible alternate version that works well in small sizes or dark backgrounds. 
        Style: ${styles}. 
        Focus on ${secondary} and ${accent} tones for contrast.`,

      icon: `Generate an **icon-only logo** (no text) for "${brandName}"${taglineText}. 
        It should represent the brand symbolically — think app icon or favicon.
        Style: ${styles}. 
        Use ${primary} and ${background} in a flat vector design.`,

      text: `Design a **text-only wordmark logo** for "${brandName}"${taglineText}. 
        Focus on typography — clean, modern, and minimal. 
        Style: ${styles}. 
        Use ${accent} text color on a white or light background.`,
    };

    return prompts[variant as keyof typeof prompts] || prompts.primary;
  }
}