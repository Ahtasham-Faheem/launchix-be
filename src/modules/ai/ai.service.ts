import OpenAI from 'openai';
import { Injectable, Logger } from '@nestjs/common';
import { brandGenratePrompt } from './prompts/brandGenratePrompt';
import { Brand } from '../brand/schemas/brand.schema';
import { BrandIdentityResult } from '../brand/interfaces/brand-identity.interface';
import { brandIdentityPrompt } from './prompts/brandIdentityPrompt';

export const BRAND_FIELDS = ['businessName', 'industry', 'tagline', 'brandStyle'] as const;

export type BrandFields = {
  businessName: string;
  industry: string;
  tagline: string;
  brandStyle: string[];
  aiFlags: Record<string, boolean>;
  errors?: string[];
};

export type BrandExtractionResult = BrandFields | { errors: string[] };

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async extractFromPrompt(prompt: string): Promise<BrandExtractionResult> {
    const resp = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: brandGenratePrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const raw = resp.choices?.[0]?.message?.content || '{}';
    this.logger.debug('AI Raw Response:', raw);

    let json: any;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      this.logger.error('JSON parse error:', err);
      return { errors: ['AI returned invalid JSON response. Please refine the prompt.'] };
    }

    this.logger.debug('AI Parsed JSON:', json);

    if (Array.isArray(json.errors) && json.errors.length > 0) {
      return { errors: json.errors };
    }

    const aiFlags =
      json.aiFlags && typeof json.aiFlags === 'object'
        ? json.aiFlags
        : {
          businessName: false,
          industry: false,
          tagline: false,
          brandStyle: false,
        };

    const brandStyle = Array.isArray(json.brandStyle)
      ? json.brandStyle
      : [json.brandStyle].filter(Boolean);

    return {
      businessName: json.businessName || '',
      industry: json.industry || '',
      tagline: json.tagline || '',
      brandStyle,
      aiFlags,
      errors: [],
    };
  }

  async regenerate(
    fields: Partial<Record<'businessName' | 'industry' | 'tagline' | 'brandStyle', boolean>>,
    context: any,
  ) {
    const needs = Object.keys(fields).filter((k) => (fields as any)[k]);
    const prompt = `Regenerate the following brand fields for a company with context:
        ${JSON.stringify(context, null, 2)}
        Fields: ${needs.join(', ')}
        Return JSON with only those fields.`;

    const resp = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You write compact JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(resp.choices[0].message.content || '{}');
  }

  pickColors(brandStyles: string[]): string[] {
    const palettes: Record<string, string[]> = {
      Modern: ['#4F46E5', '#22D3EE', '#0F172A', '#E2E8F0', '#FFFFFF'],
      Warm: ['#B45309', '#D97706', '#FDE68A', '#1F2937', '#FFFFFF'],
      Cozy: ['#8B5CF6', '#D946EF', '#F5D0FE', '#111827', '#FFFFFF'],
      Artisan: ['#6B4F2A', '#D2691E', '#F5F5DC', '#000000', '#FFFFFF'],
      Minimal: ['#111827', '#9CA3AF', '#E5E7EB', '#F9FAFB', '#FFFFFF'],
      Luxury: ['#1F2937', '#B45309', '#D1D5DB', '#F3F4F6', '#FFFFFF'],
    };

    if (!brandStyles || brandStyles.length === 0) {
      return palettes['Modern'];
    }

    const colors = brandStyles.flatMap((style) => palettes[style] || []);
    const uniqueColors = Array.from(new Set(colors));

    return uniqueColors.length > 0 ? uniqueColors : palettes['Modern'];
  }

  async generateBrandIdentity(businessName: string, industry: string, tagline: string, brandStyles: string[]): Promise<BrandIdentityResult> {
    this.logger.log(`Generating brand identity for: ${businessName}`);

    // Build contextual prompt
    const userPrompt = `
      Business Name: ${businessName}
      Industry: ${industry}
      ${tagline ? `Tagline: ${tagline}` : ''}
      ${brandStyles?.length ? `Brand Style: ${brandStyles.join(', ')}` : ''}


      Generate a comprehensive brand identity including:
      1. Vision statement (max 200 characters)
      2. Mission statement (max 200 characters)
      3. 3-5 typography pairings suitable for this brand
      4. Color palette suggestions (hex codes)

      Follow all guidelines strictly and return ONLY valid JSON as specified.
          `.trim();

    try {
      const resp = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: brandIdentityPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const raw = resp.choices?.[0]?.message?.content || '{}';
      this.logger.debug('Brand Identity Raw Response:', raw);

      const json = JSON.parse(raw);

      // Validate response
      if (json.errors && json.errors.length > 0) {
        return { errors: json.errors };
      }

      // Validate vision and mission length
      if (json.vision && json.vision.length > 200) {
        json.vision = json.vision.substring(0, 197) + '...';
      }

      if (json.mission && json.mission.length > 200) {
        json.mission = json.mission.substring(0, 197) + '...';
      }

      this.logger.log(`Successfully generated brand identity for: ${businessName}`);

      return json as BrandIdentityResult;
    } catch (err) {
      this.logger.error('Brand identity generation failed:', err);
      return {
        errors: ['Failed to generate brand identity. Please try again.'],
      };
    }
  }

  /**
   * Generate a single logo variant
   */
  async generateSingleLogo(prompt: string, type: string): Promise<{ type: string; url: string }> {
    try {
      this.logger.log(`Generating ${type} logo`);

      const img = await this.client.images.generate({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      });

      const url = img.data?.[0]?.url;
      if (!url) {
        throw new Error('No URL returned from DALL-E');
      }

      this.logger.log(`Successfully generated ${type} logo`);

      return { type, url };
    } catch (err) {
      this.logger.error(`Failed to generate ${type} logo:`, err.message);
      throw err;
    }
  }

  /**
   * Legacy method - kept for backwards compatibility but not recommended for new code
   * Use QueueService instead for better scalability
   */
  async generateLogos(brand: Brand, colors: string[]): Promise<{ type: string; url: string }[]> {
    this.logger.warn('Using legacy generateLogos method. Consider using QueueService for better performance.');

    const brandName = brand.businessName || 'Your Brand';
    const tagline = brand.tagline ? ` — tagline: "${brand.tagline}"` : '';
    const styles = Array.isArray(brand.brandStyle)
      ? brand.brandStyle.join(', ')
      : brand.brandStyle || 'Modern';

    const primary = colors[0] || '#4F46E5';
    const secondary = colors[1] || '#22D3EE';
    const background = colors[2] || '#F9FAFB';
    const accent = colors[3] || '#111827';

    const prompts = [
      {
        type: 'Primary Logo',
        prompt: `Design a **primary brand logo** for "${brandName}"${tagline}. 
      It should combine an icon or abstract mark with the brand text in a balanced layout. 
      Style: ${styles}. 
      Use ${primary} as the main color and ${secondary} as an accent. 
      Keep it professional, vector-based, and suitable for both digital and print.`,
      },
      {
        type: 'Secondary Logo',
        prompt: `Create a **secondary simplified logo** for "${brandName}"${tagline}. 
      This should be a flexible alternate version that works well in small sizes or dark backgrounds. 
      Style: ${styles}. 
      Focus on ${secondary} and ${accent} tones for contrast.`,
      },
      {
        type: 'Icon-based Logo',
        prompt: `Generate an **icon-only logo** (no text) for "${brandName}"${tagline}. 
      It should represent the brand symbolically — think app icon or favicon.
      Style: ${styles}. 
      Use ${primary} and ${background} in a flat vector design.`,
      },
      {
        type: 'Text Logo',
        prompt: `Design a **text-only wordmark logo** for "${brandName}"${tagline}. 
      Focus on typography — clean, modern, and minimal. 
      Style: ${styles}. 
      Use ${accent} text color on a white or light background.`,
      },
    ];

    const results: { type: string; url: string }[] = [];

    for (const { type, prompt } of prompts) {
      try {
        const logo = await this.generateSingleLogo(prompt, type);
        results.push(logo);
      } catch (err) {
        this.logger.error(`Failed to generate ${type}:`, err.message);
      }
    }

    return results;
  }

  async generateWebsiteJson(context: any, colors: string[]) {
    return {
      meta: { name: context.businessName, generatedAt: new Date().toISOString() },
      colors,
      pages: [
        {
          id: 'home',
          components: [
            {
              type: 'section',
              attributes: { class: 'hero', style: { background: colors[0], color: '#fff' } },
              components: [
                { type: 'h1', content: context.businessName },
                { type: 'p', content: context.tagline },
                { type: 'button', content: 'Get Started' },
              ],
            },
            {
              type: 'section',
              attributes: { class: 'features' },
              components: [
                { type: 'h2', content: 'Why Choose Us' },
                {
                  type: 'list',
                  components: [
                    { type: 'li', content: 'Quality' },
                    { type: 'li', content: 'Speed' },
                    { type: 'li', content: 'Style' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  async createMockups(): Promise<string[]> {
    return [
      'mockups/business-card.png',
      'mockups/letterhead.png',
      'mockups/social-post.png',
      'mockups/merch.png',
      'mockups/website.png',
    ];
  }
}