import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';



import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BrandAssets } from 'src/schemas/assets.schema';
import { REGENERATE_QUEUE_NAMES } from '../../constants/regenerate-queue.constants';
import { AiService } from 'src/modules/ai/ai.service';
import { JobResult, LogoRegenerationJobData } from '../../interfaces/job-data.interface';

@Processor(REGENERATE_QUEUE_NAMES.LOGO_REGENERATE, {
  concurrency: 3, // Lower concurrency due to DALL-E rate limits
  limiter: {
    max: 10, // Max 10 jobs per duration
    duration: 60000, // 1 minute
  },
})
export class LogoRegenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(LogoRegenerationProcessor.name);

  constructor(private readonly aiService: AiService,
    @InjectModel(BrandAssets.name)
    private readonly assetsModel: Model<BrandAssets>,
  ) {
    super();
  }

  async process(job: Job<LogoRegenerationJobData>): Promise<JobResult> {
    const { brandId, brand, variant } = job.data
    const { businessName, tagline, brandStyle, industry } = brand;

    this.logger.log(`Generating ${variant} logo for brand: ${brandId}`);

    try {
      // 
      const existingBrandAssets = await this.assetsModel.findOne({ brand: brandId })
      const prompt = this.buildLogoPrompt(businessName,
        tagline,
        brandStyle,
        existingBrandAssets?.palette || [],
        variant,
        industry
      );

      this.logger.log(`Logo generation prompt: ${prompt}`);

      const logo = await this.aiService.generateLogoAndUploadGPTImage(prompt, variant);

      const brandObjectId = new Types.ObjectId(brandId);

      // load existing assets (lean to get plain objects)
      const existingAssets = await this.assetsModel.findOne({ brand: brandObjectId }).lean();
      const prevLogosList = Array.isArray(existingAssets?.logos) ? existingAssets.logos : [];
      const existingLogo = prevLogosList.find(logo => logo.type === variant)

      // replace only the logo of the same type (variant). If not present, append.
      const updatedLogos = [...prevLogosList];
      const idx = updatedLogos.findIndex((l: any) => l?.type === logo.type);
      if (idx >= 0) {
        updatedLogos[idx] = logo;
      } else {
        updatedLogos.push(logo);
      }

      const update: any = {
        $set: { brand: brandObjectId, updatedAt: new Date(), logos: updatedLogos },
      };

      // push previous logos snapshot into logosHistory if there was any previous data
      if (prevLogosList.length > 0) {
        update.$push = { logosHistory: existingLogo };
      }

      await this.assetsModel.findOneAndUpdate(
        { brand: brandObjectId },
        update,
        { upsert: true, new: true },
      );


      this.logger.log(`Successfully generated ${variant} logo for brand: ${brandId}`);

      return {
        success: true,
        data: { logo },
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
    industry: string,
  ): string {
    const taglineText = tagline ? ` — tagline: "${tagline}"` : '';
    const styles = brandStyles.join(', ');
    const [primary, secondary, background, accent] = colors;

    const prompts = {
      primary: `Design a **primary brand logo** for "${brandName}"${taglineText}. 
        It should combine an icon or abstract mark with the brand text in a balanced layout. 
        Style: ${styles}. 
        Use ${primary} as the main color and ${secondary} as an accent. 
        Keep it professional, vector-based, and suitable for both digital and print.
        **IMPORTANT** Minimal flat logo for a modern ${industry}, vector style, single abstract symbol, no box, no text, transparent background, white canvas.
        **IMPORTANT** Always Provide PNG image formate with not background.
        `,

      secondary: `Create a **secondary simplified logo** for "${brandName}"${taglineText}. 
        This should be a flexible alternate version that works well in small sizes or dark backgrounds. 
        Style: ${styles}. 
        Focus on ${secondary} and ${accent} tones for contrast.
        **IMPORTANT** Minimal flat logo for a modern ${industry}, vector style, single abstract symbol, no box, no text, transparent background, white canvas.
        **IMPORTANT** Always Provide PNG image formate with not background.
        `,

      icon: `Generate an **icon-only logo** (no text) for "${brandName}"${taglineText}. 
        It should represent the brand symbolically — think app icon or favicon.
        Style: ${styles}. 
        Use ${primary} and ${background} in a flat vector design.
        **IMPORTANT** Minimal flat logo for a modern ${industry}, vector style, single abstract symbol, no box, no text, transparent background, white canvas.
        **IMPORTANT** Always Provide PNG image formate with not background.
        `,

      text: `Design a **text-only wordmark logo** for "${brandName}"${taglineText}. 
        Focus on typography — clean, modern, and minimal. 
        Style: ${styles}. 
        Use ${accent} text color on a white or light background.
        **IMPORTANT** Always Provide PNG image formate with not background.
        `
      ,
    };

    return prompts[variant as keyof typeof prompts] || prompts.primary;
  }
}