import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AiService } from '../ai/ai.service';
import { existsSync } from 'fs';
import { getUserPrompt } from './prompts/getUserPrompt';



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

        const selected = this.selectTemplate();
        const [htmlRaw, cssRaw, variablesRaw] = await this.loadTemplate(selected);

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

    private selectTemplate(): string {
        const templateList = ['template1', 'template2', 'template3'];
        const key = templateList[Math.floor(Math.random() * templateList.length)];
        // return 'template3'
        return this.templateMap[key || 'template2'] || 'template2';
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
        const htmlPath = path.join(base, folder, 'index.html');
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
