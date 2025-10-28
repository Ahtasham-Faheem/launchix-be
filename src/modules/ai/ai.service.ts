import OpenAI from 'openai';
import { brandGenratePrompt } from './prompts/brandGenratePrompt';

export const BRAND_FIELDS = ['businessName', 'industry', 'tagline', 'brandStyle'] as const;

export type BrandFields = {
  businessName: string;
  industry: string;
  tagline: string;
  brandStyle: string[]; // array of 2–3 styles
  aiFlags: Record<string, boolean>;
  errors?: string[]; // optional, empty on success
};

export type BrandExtractionResult =
  | BrandFields // success
  | { errors: string[] };

export class AiService {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async extractFromPrompt(prompt: string): Promise<BrandExtractionResult> {
    const resp = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: brandGenratePrompt }, // your new AI instruction
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const raw = resp.choices?.[0]?.message?.content || '{}';
    console.log('🧠 AI Raw Response:', raw);

    let json: any;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      console.error('❌ JSON parse error:', err);
      return { errors: ['AI returned invalid JSON response. Please refine the prompt.'] };
    }

    console.log('🧩 AI Parsed JSON:', json);

    // ✅ If AI provided errors — trust them fully and stop here
    if (Array.isArray(json.errors) && json.errors.length > 0) {
      return { errors: json.errors };
    }

    // ✅ Trust AI’s aiFlags — do not recompute
    const aiFlags =
      json.aiFlags && typeof json.aiFlags === 'object'
        ? json.aiFlags
        : {
          businessName: false,
          industry: false,
          tagline: false,
          brandStyle: false,
        };

    // ✅ Ensure brandStyle is normalized as array
    const brandStyle = Array.isArray(json.brandStyle)
      ? json.brandStyle
      : [json.brandStyle].filter(Boolean);

    // ✅ Return the AI’s structured fields, even if empty — let higher layer decide next steps
    return {
      businessName: json.businessName || '',
      industry: json.industry || '',
      tagline: json.tagline || '',
      brandStyle,
      aiFlags,
      errors: [],
    };
  }



  async regenerate(fields: Partial<Record<'businessName' | 'industry' | 'tagline' | 'brandStyle', boolean>>, context: any) {
    const needs = Object.keys(fields).filter(k => (fields as any)[k]);
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

    // 🧩 If no valid styles provided, default to Modern
    if (!brandStyles || brandStyles.length === 0) {
      return palettes['Modern'];
    }

    // 🧠 Collect all unique colors from selected styles
    const colors = brandStyles.flatMap((style) => palettes[style] || []);

    // 🧹 Remove duplicates while keeping order
    const uniqueColors = Array.from(new Set(colors));

    // 🎨 If somehow empty (unknown styles), fallback
    return uniqueColors.length > 0 ? uniqueColors : palettes['Modern'];
  }

  async generateLogos(brandName: string, colors: string[]) {
    const prompts = [
      `Minimal flat logo mark for ${brandName}, ${colors[0]} primary, vector, centered`,
      `Wordmark logo for ${brandName}, clean sans-serif, ${colors[1]} accent`,
      `Badge logo for ${brandName}, ${colors[2]} background, high contrast`,
      `Icon + text lockup for ${brandName}, ${colors[0]} + ${colors[3]}`,
    ];
    const results: string[] = [];
    for (const p of prompts) {
      const img = await this.client.images.generate({
        model: 'dall-e-3',
        prompt: p,
        size: '1024x1024',
        n: 1,
      });
      const url = img.data[0].url!;
      results.push(url);
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
              type: 'section', attributes: { class: 'hero', style: { background: colors[0], color: '#fff' } },
              components: [
                { type: 'h1', content: context.businessName },
                { type: 'p', content: context.tagline },
                { type: 'button', content: 'Get Started' }
              ]
            },
            {
              type: 'section', attributes: { class: 'features' }, components: [
                { type: 'h2', content: 'Why Choose Us' },
                {
                  type: 'list', components: [
                    { type: 'li', content: 'Quality' },
                    { type: 'li', content: 'Speed' },
                    { type: 'li', content: 'Style' },
                  ]
                }
              ]
            }
          ]
        }
      ]
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
