import OpenAI from 'openai';
import { Injectable, Logger } from '@nestjs/common';
import { brandGenratePrompt } from './prompts/brandGenratePrompt';
import { Brand } from '../../schemas/brand.schema';
import { BrandIdentityResult } from '../brand/interfaces/brand-identity.interface';
import { brandIdentityPrompt } from './prompts/brandIdentityPrompt';
import { websitePrompt } from './prompts/websitePrompt';
import { contentGeneratePrompt } from './prompts/contentGenratePrompt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { WebsiteType } from 'src/shared/types';
import { regenerateColorsystemPrompt, regenerateColorUserPrompt } from './prompts/regenerate/regenerate-color.prompt';


@Injectable()
export class RegenAiService {
  private readonly logger = new Logger(RegenAiService.name);
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(private readonly cloudinary: CloudinaryService) { }

  /**
  * Send messages to OpenAI and return parsed JSON.
  * - userPrompt: main user message
  * - systemPrompt: system instruction (optional)
  *
  * Returns { data: any } on success or { errors: [...] } on error.
  */
  async generateJson(userPrompt: string, systemPrompt = 'You are a helpful assistant. Respond with valid JSON only.'): Promise<any> {
    try {
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: userPrompt });

      const resp = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0,
        max_tokens: 1500,
      });

      // safe extraction for different SDK shapes
      const rawContent =
        // chat.completions shape
        (resp as any)?.choices?.[0]?.message?.content ??
        // responses endpoint shape
        (resp as any)?.output?.[0]?.content?.[0]?.text ??
        '';

      const cleaned = String(rawContent).replace(/```(?:json)?\n?|```/g, '').trim();

      let json;
      try {
        json = JSON.parse(cleaned);
      } catch (parseErr) {
        return { errors: [{ message: 'Invalid JSON from model', raw: cleaned }] };
      }

      if (json && Array.isArray(json.errors) && json.errors.length > 0) {
        return { errors: json.errors };
      }

      return { data: json };
    } catch (err) {
      const e = err as any;
      this.logger.error('OpenAI request failed', e?.message ?? err);
      return { errors: [{ message: e?.message ?? 'OpenAI request failed', detail: e }] };
    }
  }


  async generateColorPalette(
    businessName: string,
    tagline: string,
    industry: string,
    brandStyles: string[] = [],
    typeOfWebsite: string
  ): Promise<any> {
    const userPrompt = regenerateColorUserPrompt({ businessName, tagline, industry, brandStyles, typeOfWebsite })
    return await this.generateJson(userPrompt, regenerateColorsystemPrompt);
  }


}