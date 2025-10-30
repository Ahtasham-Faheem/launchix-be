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

/**
 * Dynamically builds a brand-specific AI prompt for website content generation.
 * It uses the variablesRaw JSON to determine which placeholders (HTML + CSS)
 * must be filled by the AI.
 */

export function getUserPrompt(
    businessName: string,
    industry: string,
    tagline: string,
    vision: string,
    mission: string,
    logoUrl: string,
    variablesRaw: string,
): string {
    // 🧩 Parse the variables JSON
    let vars: any = {};
    try {
        vars = JSON.parse(variablesRaw);
    } catch (err) {
        throw new Error('❌ Invalid variablesRaw JSON format');
    }

    // Flatten variable keys from both HTML + CSS
    const htmlVars = vars.html ? Object.keys(vars.html) : [];
    const cssVars = vars.css ? Object.keys(vars.css) : [];

    // 🧱 Convert variable structure into readable schema for AI
    const formattedHtmlVars = htmlVars
        .map((v) => `  "${v}": "string",`)
        .join('\n');

    const formattedCssVars = cssVars
        .map((v) => `  "${v}": "string",`)
        .join('\n');

    // 🧠 Dynamic AI Prompt
    const prompt = `
You are an expert AI content generator that specializes in building complete, brand-specific website data structures.
You must output a single JSON object — no markdown, no comments, no text outside JSON.
The output will be used directly to replace website placeholders, so every key must be filled.

🎯 OBJECTIVE:
Generate full website content and styling variables for the brand below.
Every value must be directly related to this business — DO NOT create generic placeholders.

Brand Context:
- Business Name: "${businessName}"
- Industry: "${industry}"
- Tagline: "${tagline}"
- Vision: "${vision}"
- Mission: "${mission}"
- Logo URL: "${logoUrl}"

 FOR LOGO YOU MUST USE MY PROVIDED LOGO URL AND NOT MAKE UP ANYTHING.

🏗️ REQUIRED OUTPUT STRUCTURE:
{
  "html": {
${formattedHtmlVars}
  },
  "css": {
${formattedCssVars}
  }
}

🧩 INSTRUCTIONS:
- Return all values as human-written, premium, and brand-specific.
- Make the tone consistent with the brand's industry (e.g., professional, calming, creative, luxury, etc.).
- Use emotional, natural language for text (not robotic or templated).
- Fill in ALL empty fields — never leave blank strings.
- For any variable containing "image", "img", or "background":
  → Return a descriptive image keyword (e.g., "modern fitness studio interior" or "luxury spa ambience").
- For "color", "accent", or "gradient" variables:
  → Return visually appealing hex codes or gradient CSS values based on brand tone.
- For "socialLinks":
  → Use realistic URLs like "https://facebook.com/${businessName.toLowerCase().replace(/\s+/g, '')}".
- For "currentYear":
  → Return the current year (e.g., 2025).
- Ensure the final JSON is syntactically valid and does not include trailing commas.
- Never output explanatory text, comments, or markdown fences.

Your goal: produce a complete, ready-to-inject JSON that can fill every placeholder in the brand’s HTML and CSS template.
`;

    return prompt.trim();
}



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

        // const selected = this.selectTemplate(industry);
        const [htmlRaw, cssRaw, variablesRaw] = await this.loadTemplate('template2');

        // 🧠 Step 1: Generate brand-specific content via AI
        const prompt = getUserPrompt(businessName, industry, tagline, vision, mission, logoUrl, variablesRaw);
        const aiResponse = await this.aiService.extractContent(prompt);
        const content = aiResponse || {};

        // 🎨 Step 2: Merge user-provided color scheme or use AI/CSS defaults
        const colors = colorScheme || content.css || this.defaultColors;
        const htmlVars = content.html || {};

        // 🪄 Step 3: Universal HTML replacement based on AI variables
        let html = htmlRaw;

        for (const [key, value] of Object.entries(htmlVars)) {
            const pattern = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(pattern, String(value ?? ''));
        }

        // 🖼 Step 4: Replace missing image placeholders with Unsplash keywords
        html = html.replace(/{{[^{}]*(image|img)[^{}]*}}/gi, (match) => {
            return this.unsplash(industry, Math.floor(Math.random() * 10) + 1);
        });

        // 🎨 Step 5: Universal CSS replacement based on AI variables
        let css = cssRaw;
        for (const [key, value] of Object.entries(colors)) {
            const pattern = new RegExp(`{{${key}}}`, 'g');
            css = css.replace(pattern, String(value ?? ''));
        }

        // 🧩 Step 6: Return structured website result
        return {
            grapesjs: {
                html,
                css,
                components: [],
                styles: [],
            },
            metadata: {
                businessName,
                industry,
                colorScheme: colors,
                logoUrl,
                sections: Object.keys(htmlVars),
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

    private async loadTemplate(folder: string): Promise<[string, string, string]> {
        const base = this.getTemplateBasePath();
        const htmlPath = path.join(base, folder, 'template.html');
        const cssPath = path.join(base, folder, 'style.css');
        const variablesPath = path.join(base, folder, 'variables.json');

        const html = await fs.readFile(htmlPath, 'utf8');
        const css = await fs.readFile(cssPath, 'utf8');
        const variables = await fs.readFile(variablesPath, 'utf8');
        return [html, css, variables];
    }

    private unsplash(keyword: string, sig = 1) {
        const clean = keyword.split(' ')[0];
        return `https://source.unsplash.com/random/1600x900/?${clean}&sig=${sig}`;
    }
}
