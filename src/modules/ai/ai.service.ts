import OpenAI from 'openai';

const BRAND_FIELDS = ['businessName','industry','tagline','brandStyle'] as const;
export type BrandFields = Record<typeof BRAND_FIELDS[number], string> & { aiFlags: Record<string, boolean> };

export class AiService {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async extractFromPrompt(prompt: string): Promise<BrandFields> {
    const sys = `You are an expert brand strategist. Extract four fields from user prompt:
- businessName (string)
- industry (string, concise)
- tagline (short, catchy)
- brandStyle (one of: Modern, Warm, Cozy, Artisan).
If a field is absent, invent a good value and mark its flag in aiFlags as true. Respond in strict JSON.`;

    const resp = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const json = JSON.parse(resp.choices[0].message.content || '{}');
    const aiFlags = {
      businessName: !json.businessName || json.aiGenerated?.businessName === true,
      industry: !json.industry || json.aiGenerated?.industry === true,
      tagline: !json.tagline || json.aiGenerated?.tagline === true,
      brandStyle: !json.brandStyle || json.aiGenerated?.brandStyle === true,
    };
    return {
      businessName: json.businessName,
      industry: json.industry,
      tagline: json.tagline,
      brandStyle: json.brandStyle,
      aiFlags,
    };
  }

  async regenerate(fields: Partial<Record<'businessName'|'industry'|'tagline'|'brandStyle', boolean>>, context: any) {
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

  pickColors(brandStyle: string) {
    const palettes: Record<string, string[]> = {
      Modern: ['#4F46E5','#22D3EE','#0F172A','#E2E8F0','#FFFFFF'],
      Warm: ['#B45309','#D97706','#FDE68A','#1F2937','#FFFFFF'],
      Cozy: ['#8B5CF6','#D946EF','#F5D0FE','#111827','#FFFFFF'],
      Artisan: ['#6B4F2A','#D2691E','#F5F5DC','#000000','#FFFFFF'],
    };
    return palettes[brandStyle] || palettes['Modern'];
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
            { type: 'section', attributes: { class: 'hero', style: { background: colors[0], color: '#fff' } },
              components: [
                { type: 'h1', content: context.businessName },
                { type: 'p', content: context.tagline },
                { type: 'button', content: 'Get Started' }
              ]
            },
            { type: 'section', attributes: { class: 'features' }, components: [
              { type: 'h2', content: 'Why Choose Us' },
              { type: 'list', components: [
                { type: 'li', content: 'Quality' },
                { type: 'li', content: 'Speed' },
                { type: 'li', content: 'Style' },
              ]}
            ]}
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
