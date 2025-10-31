import OpenAI from 'openai';
import { Injectable, Logger } from '@nestjs/common';
import { brandGenratePrompt } from './prompts/brandGenratePrompt';
import { Brand } from '../../schemas/brand.schema';
import { BrandIdentityResult } from '../brand/interfaces/brand-identity.interface';
import { brandIdentityPrompt } from './prompts/brandIdentityPrompt';
import { websitePrompt } from './prompts/websitePrompt';
import { contenGeneratePropmt } from './prompts/contentGenratePrompt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

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

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface WebsiteMetadata {
  businessName: string;
  industry: string;
  colorScheme: ColorScheme;
  logoUrl: string;
  sections: string[];
}

interface GrapesJSWebsite {
  html: string;
  css: string;
  components: any[];
  assets: any[];
  styles: any[];
}

interface WebsiteResult {
  grapesjs?: GrapesJSWebsite;
  metadata?: WebsiteMetadata;
  errors?: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(private readonly cloudinary: CloudinaryService) {}

  async extractFromPrompt(prompt: string): Promise<BrandExtractionResult> {
    // return {
    //   businessName: 'FitLife',
    //   industry: 'Health & Wellness',
    //   tagline: 'Empowering Your Best Self',
    //   brandStyle: ['Modern', 'Energetic'],
    //   aiFlags: {
    //     businessName: true,
    //     industry: true,
    //     tagline: true,
    //     brandStyle: true,
    //   },
    //   errors: [],
    // };
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

  async extractContent<T = any>(prompt: string): Promise<T> {
    this.logger.log(`🧠 Generating structured content via AI...`);

    try {
      const resp = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: contenGeneratePropmt,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const raw = resp.choices?.[0]?.message?.content?.trim() || '{}';
      this.logger.debug('AI Raw Response:', raw);

      let json: any;
      try {
        json = JSON.parse(raw);
      } catch (err) {
        this.logger.error('❌ JSON parse error:', err);
        return {} as T;
      }

      this.logger.debug('✅ AI Parsed JSON:', json);
      return json as T;
    } catch (error) {
      this.logger.error('❌ extractFromPrompt failed:', error);
      return {} as T;
    }
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

  
  async generateSingleLogoDall_e_3(prompt: string, type: string): Promise<{ type: string; url: string }> {
    try {
      this.logger.log(`Generating ${type} logo`);

      const img = await this.client.images.generate({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      });

      console.log('img', img)

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

  async generateLogoAndUploadGPTImage(prompt: string, type: string): Promise<{ type: string; url: string }> {
    try {
      const img = await this.client.images.generate({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
        quality: 'low',
        n: 1,
      });

      const base64 = img.data?.[0]?.b64_json;
      if (!base64) throw new Error('No base64 data returned from OpenAI');

      // ✅ Upload to Cloudinary
      const url = await this.cloudinary.uploadBase64Image(base64, 'launchix_ai_logos');

      return { type, url };
    } catch (error) {
      console.error('❌ AI Image Generation + Upload Failed:', error.message);
      throw error;
    }
  }


  /**
   * Generate premium website with AI-generated colors, working images, and logo
   */
  async generatePremiumWebsite(
    businessName: string,
    industry: string,
    tagline: string,
    vision: string,
    mission: string,
    logoUrl: string,
  ): Promise<WebsiteResult> {
    this.logger.log(`Generating premium website for: ${businessName}`);

    // Build system prompt with all context
    const systemContent = websitePrompt({
      businessName,
      tagline,
      vision,
      mission,
      industry,
      logoUrl
    });

    // User prompt to enforce requirements
    const userPrompt = `
Generate a complete GrapesJS website in JSON format for "${businessName}".

CRITICAL REQUIREMENTS:
1. Generate UNIQUE color scheme (5 colors in hex format) based on industry and brand personality
2. Create logo URL using placeholder.com with generated primary color
3. Use ONLY real, working image URLs from Unsplash (photo IDs provided in prompt)
4. All content must be specific to: "${businessName}" in ${industry} industry
5. Vision: ${vision}
6. Mission: ${mission}

Return ONLY valid JSON with no markdown or comments.
`.trim();

    try {
      const resp = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const raw = resp.choices?.[0]?.message?.content || '{}';
      this.logger.debug(`Website Raw Response: ${raw.slice(0, 500)}...`);

      let json: any;
      try {
        json = JSON.parse(raw);
      } catch (err) {
        this.logger.error('Website JSON parse failed:', err);
        return { errors: ['AI returned invalid JSON. Please try again.'] };
      }

      // Check for errors in response
      if (json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
        return { errors: json.errors };
      }

      // Validate required structure
      if (!json.grapesjs || typeof json.grapesjs !== 'object') {
        this.logger.error('Missing grapesjs object in response');
        return { errors: ['Invalid website structure. Missing GrapesJS data.'] };
      }

      if (!json.metadata || !json.metadata.colorScheme) {
        this.logger.error('Missing metadata or color scheme');
        return { errors: ['Invalid website structure. Missing metadata or colors.'] };
      }

      // Validate GrapesJS structure
      const gjs = json.grapesjs;

      if (!gjs.html || typeof gjs.html !== 'string') {
        this.logger.warn('Missing or invalid HTML, using fallback');
        gjs.html = '<div>Website content</div>';
      }

      if (!gjs.css || typeof gjs.css !== 'string') {
        this.logger.warn('Missing or invalid CSS, using fallback');
        gjs.css = this.generateFallbackCSS();
      }

      if (!Array.isArray(gjs.components)) {
        this.logger.warn('Missing components array, initializing empty');
        gjs.components = [];
      }

      if (!Array.isArray(gjs.assets)) {
        this.logger.warn('Missing assets array, initializing empty');
        gjs.assets = [];
      }

      if (!Array.isArray(gjs.styles)) {
        this.logger.warn('Missing styles array, initializing empty');
        gjs.styles = [];
      }

      // Validate metadata
      const metadata = json.metadata;

      if (!metadata.colorScheme || typeof metadata.colorScheme !== 'object') {
        this.logger.error('Invalid color scheme in metadata');
        return { errors: ['Invalid color scheme generated.'] };
      }

      // Ensure all required colors exist
      const requiredColors = ['primary', 'secondary', 'accent', 'background', 'text'];
      const missingColors = requiredColors.filter(color => !metadata.colorScheme[color]);

      if (missingColors.length > 0) {
        this.logger.error(`Missing colors: ${missingColors.join(', ')}`);
        return { errors: [`Missing required colors: ${missingColors.join(', ')}`] };
      }

      // Validate hex color format
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      const invalidColors = requiredColors.filter(
        color => !hexColorRegex.test(metadata.colorScheme[color])
      );

      if (invalidColors.length > 0) {
        this.logger.error(`Invalid color format: ${invalidColors.join(', ')}`);
        return { errors: [`Invalid color format for: ${invalidColors.join(', ')}`] };
      }

      // Validate logo URL
      if (!metadata.logoUrl || !metadata.logoUrl.startsWith('https://')) {
        this.logger.warn('Invalid logo URL, generating fallback');
        const primaryColor = metadata.colorScheme.primary.replace('#', '');
        const brandName = businessName.replace(/\s+/g, '+');
        metadata.logoUrl = `https://via.placeholder.com/200x60/${primaryColor}/FFFFFF?text=${brandName}`;
      }

      // Validate sections array
      if (!Array.isArray(metadata.sections) || metadata.sections.length === 0) {
        this.logger.warn('Missing sections array, using default');
        metadata.sections = ['hero', 'about', 'services', 'gallery', 'testimonials', 'contact'];
      }

      // Log success with details
      this.logger.log(`Successfully generated website for: ${businessName}`);
      this.logger.log(`Color Scheme: ${JSON.stringify(metadata.colorScheme)}`);
      this.logger.log(`Logo URL: ${metadata.logoUrl}`);
      this.logger.log(`Sections: ${metadata.sections.join(', ')}`);
      this.logger.log(`Components: ${gjs.components.length}`);
      this.logger.log(`Assets: ${gjs.assets.length}`);

      return json as WebsiteResult;
    } catch (err: any) {
      this.logger.error('Website generation failed:', err?.message || err);
      return { errors: ['Failed to generate website. Please try again.'] };
    }
  }

  /**
   * Generate fallback CSS if AI doesn't provide valid CSS
   */
  private generateFallbackCSS(): string {
    return `
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: #1F2937;
        background-color: #FFFFFF;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 80px 20px;
      }

      section {
        width: 100%;
      }

      h1 {
        font-size: 48px;
        font-weight: 700;
        line-height: 1.2;
        margin: 0 0 16px 0;
      }

      h2 {
        font-size: 36px;
        font-weight: 700;
        line-height: 1.3;
        margin: 0 0 16px 0;
      }

      h3 {
        font-size: 24px;
        font-weight: 600;
        line-height: 1.4;
        margin: 0 0 16px 0;
      }

      p {
        font-size: 16px;
        line-height: 1.6;
        margin: 0 0 16px 0;
      }

      a {
        text-decoration: none;
        transition: all 0.3s ease;
      }

      img {
        max-width: 100%;
        height: auto;
        display: block;
      }

      button, .btn {
        display: inline-block;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
      }

      .grid {
        display: grid;
        gap: 24px;
      }

      .grid-2 {
        grid-template-columns: repeat(2, 1fr);
      }

      .grid-3 {
        grid-template-columns: repeat(3, 1fr);
      }

      .card {
        background-color: #FFFFFF;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      }

      @media (max-width: 768px) {
        .container {
          padding: 40px 15px;
        }

        h1 {
          font-size: 32px;
        }

        h2 {
          font-size: 28px;
        }

        h3 {
          font-size: 20px;
        }

        .grid-2,
        .grid-3 {
          grid-template-columns: 1fr;
        }
      }
    `;
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