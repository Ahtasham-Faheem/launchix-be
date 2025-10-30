import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AiService } from '../ai/ai.service';
import { existsSync } from 'fs';



interface WebsiteResult {
    grapesjs: {
        html: string;
        css: string;
        components: any[];
        styles: any[];
    };
    metadata: {
        businessName: string;
        industry: string;
        colorScheme: Record<string, string>;
        logoUrl: string;
        sections: string[];
    };
}

const getUserPrompt = (businessName: string, industry: string, tagline: string, vision: string, mission: string) => {
    return `
Generate premium, human-like marketing content for a business website.
Respond only in JSON format with the following keys:
{
  "heroTitle": "Main hero headline (max 12 words)",
  "heroSubtitle": "Short subheading below hero title (max 20 words)",
  "aboutText": "1-2 sentence About section describing purpose, personality, and trustworthiness.",
  "serviceTitles": ["3 short service titles"],
  "serviceDescriptions": ["3 matching descriptions — 1-2 sentences each"],
  "testimonial": "Customer testimonial or quote in quotes.",
  "ctaText": "Short call-to-action (CTA) encouraging engagement."
}

### BUSINESS CONTEXT
- Business Name: ${businessName}
- Industry: ${industry}
- Tagline: ${tagline}
- Vision: ${vision}
- Mission: ${mission}

### WRITING INSTRUCTIONS
1. Adapt tone, vocabulary, and emotion based on the industry:
   - SaaS / Tech: clean, confident, forward-looking, problem-solving.
   - Fitness / Wellness: motivational, energetic, personal.
   - Restaurant / Food: sensory, emotional, welcoming.
   - Real Estate: elegant, aspirational, trustworthy.
   - Agency / Creative: bold, modern, expressive.
2. Focus on clarity and credibility.
3. Every section should sound like it belongs to a modern premium brand.
4. Avoid filler, repetition, and generic statements.
5. Include naturally persuasive language and emotional connection.
6. Ensure the content reads like a finished website copy — no placeholders.
7. Do not include any empty strings or null values.

Return a **single valid JSON object** only — no explanations, markdown, or text outside the JSON.
`;
};


@Injectable()
export class WebsiteTemplateService {
    private readonly logger = new Logger(WebsiteTemplateService.name);
    private readonly basePath = path.join(__dirname, 'templates');

    constructor(private readonly aiService: AiService) { }

    // Mapping of industries → template folder
    private templateMap: Record<string, string> = {
        technology: 'saas',
        software: 'saas',
        startup: 'saas',
        restaurant: 'restaurant',
        food: 'restaurant',
        fitness: 'fitness',
        gym: 'fitness',
        realestate: 'realestate',
        property: 'realestate',
    };

    private defaultColors = {
        primary: '#4F46E5',
        secondary: '#22D3EE',
        accent: '#0EA5E9',
        background: '#FFFFFF',
        text: '#111827',
    };

    /**
     *  Main entry point
     */
    async buildWebsite(
        businessName: string,
        industry: string,
        tagline: string,
        vision: string,
        mission: string,
        logoUrl: string,
        colorScheme?: Record<string, string>,
    ): Promise<WebsiteResult> {
        this.logger.log(`⚡ Building template website for ${businessName}`);

        const selected = this.selectTemplate(industry);
        const [htmlRaw, cssRaw] = await this.loadTemplate(selected);

        // 🧠 Ask AI for section content
        const prompt = getUserPrompt(businessName, industry, tagline, vision, mission)
        const content = await this.aiService.extractContent(prompt);
        const c: any = (content as any) || {};

        // 🎨 Replace placeholders
        const colors = colorScheme || this.defaultColors;
        let html = htmlRaw
            .replace(/{{businessName}}/g, businessName)
            .replace(/{{tagline}}/g, tagline)
            .replace(/{{heroTitle}}/g, c.heroTitle || businessName)
            .replace(/{{heroSubtitle}}/g, c.heroSubtitle || tagline)
            .replace(/{{aboutText}}/g, c.aboutText || vision)
            .replace(/{{service1}}/g, c.serviceTitles?.[0] || 'Service One')
            .replace(/{{service2}}/g, c.serviceTitles?.[1] || 'Service Two')
            .replace(/{{service3}}/g, c.serviceTitles?.[2] || 'Service Three')
            .replace(/{{desc1}}/g, c.serviceDescriptions?.[0] || 'Quality you can trust.')
            .replace(/{{desc2}}/g, c.serviceDescriptions?.[1] || 'Professional results every time.')
            .replace(/{{desc3}}/g, c.serviceDescriptions?.[2] || 'Built for growth.')
            .replace(/{{testimonial}}/g, c.testimonial || 'Outstanding experience!')
            .replace(/{{ctaText}}/g, c.ctaText || 'Get Started')
            .replace(/{{logoUrl}}/g, logoUrl);

        // 🖼  Replace Unsplash keywords dynamically
        html = html.replace(/{{heroImg}}/g, this.unsplash(industry, 1))
            .replace(/{{aboutImg}}/g, this.unsplash(industry, 2))
            .replace(/{{serviceImg}}/g, this.unsplash(industry, 3));

        const css = cssRaw
            .replace(/{{primary}}/g, colors.primary)
            .replace(/{{secondary}}/g, colors.secondary)
            .replace(/{{accent}}/g, colors.accent)
            .replace(/{{background}}/g, colors.background)
            .replace(/{{text}}/g, colors.text);

        return {
            grapesjs: { html, css, components: [], styles: [] },
            metadata: {
                businessName,
                industry,
                colorScheme: colors,
                logoUrl,
                sections: ['hero', 'about', 'services', 'testimonial', 'contact'],
            },
        };
    }

    private selectTemplate(industry: string): string {
        const key = Object.keys(this.templateMap).find(k =>
            industry.toLowerCase().includes(k),
        );
        return this.templateMap[key || 'default'] || 'default';
    }

    private getTemplateBasePath(): string {
        // When running in production (dist), adjust base directory
        const distPath = path.join(__dirname, 'templates');
        const srcPath = path.join(process.cwd(), 'src/modules/website/templates');

        if (existsSync(distPath)) return distPath;
        if (existsSync(srcPath)) return srcPath;

        this.logger.error(`❌ Template folder not found at ${distPath} or ${srcPath}`);
        throw new Error('Template folder missing — please ensure it’s copied to dist.');
    }

    private async loadTemplate(folder: string): Promise<[string, string]> {
        const base = this.getTemplateBasePath();
        const htmlPath = path.join(base, folder, 'template.html');
        const cssPath = path.join(base, folder, 'style.css');

        const html = await fs.readFile(htmlPath, 'utf8');
        const css = await fs.readFile(cssPath, 'utf8');
        return [html, css];
    }

    private unsplash(keyword: string, sig = 1) {
        const clean = keyword.split(' ')[0];
        return `https://source.unsplash.com/random/1600x900/?${clean}&sig=${sig}`;
    }
}
