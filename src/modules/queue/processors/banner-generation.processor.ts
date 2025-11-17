import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../constants/queue.constants';
import { LogoGenerationJobData, JobResult, BannerGenerationJobData } from '../interfaces/job-data.interface';
import { AiService } from '../../ai/ai.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BrandAssets } from 'src/schemas/assets.schema';

@Processor(QUEUE_NAMES.BANNER_GENERATION, {
  concurrency: 3, // Lower concurrency due to DALL-E rate limits
  limiter: {
    max: 10, // Max 10 jobs per duration
    duration: 60000, // 1 minute
  },
})
export class BannerGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(BannerGenerationProcessor.name);

  constructor(private readonly aiService: AiService,
    @InjectModel(BrandAssets.name)
    private readonly assetsModel: Model<BrandAssets>,
  ) {
    super();
  }

  async process(job: Job<BannerGenerationJobData>): Promise<JobResult> {
    const { brandId, brandName, tagline, brandStyles, colors, variant, industry } = job.data;

    this.logger.log(`Generating ${variant} banner for brand: ${brandId}`);

    try {
      const prompt = this.buildBannerPrompt(brandName, tagline, brandStyles, colors, variant, industry);

      this.logger.log(`Banner generation prompt: ${prompt}`);

      const banner = await this.aiService.generateBannerAndUploadGPTImage(prompt, variant);

      const brandObjectId = new Types.ObjectId(brandId);

      await this.assetsModel.findOneAndUpdate(
        { brand: brandObjectId },
        {
          $set: { brand: brandObjectId, updatedAt: new Date() },
          $push: { banners: banner },
        },
        { upsert: true, new: true },
      );


      this.logger.log(`Successfully generated ${variant} banner for brand: ${brandId}`);

      return {
        success: true,
        data: { banner },
        brandId,
      };
    } catch (error) {
      this.logger.error(`Banner generation failed for brand ${brandId}:`, error.message);

      // Check if it's a rate limit error
      if (error.message?.includes('rate_limit')) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      throw error;
    }
  }

  private buildBannerPrompt(
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
      linkedin: `
Design a **LinkedIn company banner** for "${brandName}"${taglineText}.
- Purpose: Professional cover banner for a company profile or page.
- Style: ${styles}.
- Use ${primary} and ${secondary} as dominant colors, with ${accent} highlights.
- Maintain a **clean, modern, and corporate aesthetic**.
- Include the brand name "${brandName}" and tagline if available.
- Avoid crowded elements.
- Size ratio: 1536x768.
- **IMPORTANT**: Minimalistic, premium, vector-style layout with a strong visual hierarchy.
- **Do not include social icons or personal faces.**
- **Transparent logo area, high-contrast text area, gradient overlays.**
- **Output: PNG format, 1536x768, no watermark, no rounded corners, professional banner layout.**
`,

      twitter: `
Create a **Twitter (X) profile banner** for "${brandName}"${taglineText}.
- Style: ${styles}.
- Use ${primary} and ${secondary} as brand colors with soft gradients.
- Purpose: Header for brand Twitter profile.
- Aesthetic: Modern, bold, high-contrast.
- Include brand name "${brandName}" prominently and tagline if available.
- Use subtle patterns or abstract background related to ${industry}.
- Size ratio: 1500x500.
- **IMPORTANT**: Clean, sharp, professional look with centered layout.
- **Do not include icons, faces, or mock social elements.**
- **Output: PNG format, 1500x500, transparent background preferred, crisp typography.**
`,

      facebook: `
Design a **Facebook business page banner** for "${brandName}"${taglineText}.
- Style: ${styles}.
- Use ${primary} as main brand tone, ${secondary} and ${accent} for depth.
- Size ratio: 1640x924.
- Include "${brandName}" text and tagline clearly visible.
- Clean, approachable, professional tone suitable for business and marketing.
- Include subtle texture or gradient background.
- **IMPORTANT**: Avoid excessive whitespace or icons.
- **Output: PNG format, 1640x924, centered composition, no watermark, clear typography.**
`,

      instagram: `
Create an **Instagram story/banner post** for "${brandName}"${taglineText}.
- Format: square, 1080x1080.
- Style: ${styles}, vibrant, social-media ready.
- Use ${primary} and ${accent} tones.
- Include "${brandName}" and tagline with visually balanced layout.
- Modern, gradient-rich aesthetic suitable for lifestyle or ${industry} branding.
- **IMPORTANT**: Focus on visual appeal; no extra text other than brand and tagline.
- **Output: PNG format, 1080x1080, no watermark, sharp and clean visuals.**
`,
    };

    return prompts[variant as keyof typeof prompts] || prompts.linkedin;
  }

}