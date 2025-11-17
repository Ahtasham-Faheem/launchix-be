import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import {
  generateCompleteWebsitePrompt,
  WebsiteGenerationInput
} from '../prompts/generateCompleteWebsitePrompt';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class WebsiteGeneratorService {
  private readonly logger = new Logger(WebsiteGeneratorService.name);
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate a complete multi-section website with HTML, CSS, and JavaScript
   */
  async generateCompleteWebsite(
    input: WebsiteGenerationInput
  ): Promise<string> {
    this.logger.log(`🌐 Generating complete website for: ${input.businessName}`);

    try {
      const prompt = generateCompleteWebsitePrompt(input);

      let fullHtml = '';
      let attempt = 0;
      let finished = false;

      while (!finished && attempt < 4) {
        attempt++;
        this.logger.log(`🧩 Generating chunk #${attempt} for ${input.businessName}...`);

        // Include previous HTML as context if continuing
        const messages: any[] = [
          {
            role: 'system',
            content:
              'You are an expert web developer who writes full production-ready single-page websites with embedded CSS and JavaScript.',
          },
        ];

        if (attempt === 1) {
          messages.push({ role: 'user', content: prompt });
        } else {
          // Include previous HTML so model knows what it wrote
          const safeContext = fullHtml.slice(-8000); // last portion only
          messages.push({
            role: 'user',
            content: `
Here is the HTML generated so far (do not repeat this part):
${safeContext}

Continue generating from where it stopped. 
Output only the missing remaining HTML until the closing </html> tag. 
Do not start over or repeat earlier code.
          `.trim(),
          });
        }

        const response = await this.client.chat.completions.create({
          model: 'gpt-4.1',
          messages,
          temperature: 0.7,
          max_tokens: 5000,
        });

        const chunk = response.choices?.[0]?.message?.content?.trim() || '';
        fullHtml += '\n' + chunk;

        if (chunk.includes('</html>')) {
          finished = true;
          this.logger.log(`✅ Completed HTML detected after chunk #${attempt}.`);
        } else {
          this.logger.warn(`⚠️ Chunk #${attempt} incomplete, continuing...`);
        }
      }

      // --- Validate & Cleanup ---
      fullHtml = fullHtml
        .replace(/```html/g, '')
        .replace(/```/g, '')
        .trim();

      if (!fullHtml.includes('<!DOCTYPE html>')) {
        throw new Error('❌ Invalid or missing <!DOCTYPE html> declaration.');
      }

      if (!fullHtml.includes('</html>')) {
        this.logger.warn('⚠️ Missing closing </html> tag — appending automatically.');
        fullHtml += '\n</html>';
      }

      this.logger.log(`✅ Website generation complete (${fullHtml.length} chars).`);
      return fullHtml;
    } catch (error) {
      this.logger.error('❌ Website generation failed:', error);
      throw new Error('Website generation failed. Please try again.');
    }
  }

  async generateWebsiteHTML(input: WebsiteGenerationInput): Promise<string> {
    this.logger.log(`🧱 Generating HTML layout for ${input.businessName}`);

    const prompt = `
Generate a complete, semantic HTML5 structure for a ${input.industry} website named "${input.businessName}".
Do not include <style> or <script> tags.
Use section IDs: ${input.sections.join(', ')}.
Each section must have placeholder content with realistic text and image placeholders.
Output only valid HTML starting with <!DOCTYPE html>.
`;

    const res = await this.client.chat.completions.create({
      model: 'gpt-4.1',
      temperature: 0.7,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: 'You are a senior front-end developer writing clean semantic HTML only.' },
        { role: 'user', content: prompt },
      ],
    });

    const html = res.choices?.[0]?.message?.content?.trim() || '';
    if (!html.includes('<!DOCTYPE html>')) throw new Error('Invalid HTML output.');
    return html;
  }

  async generateWebsiteCSS(html: string, colorScheme: any): Promise<string> {
    this.logger.log(`🎨 Generating CSS theme...`);

    const prompt = `
Analyze the following HTML structure and generate a complete modern CSS stylesheet.
Use this color scheme:
${JSON.stringify(colorScheme, null, 2)}

Requirements:
- Responsive design (mobile, tablet, desktop)
- Flexbox/Grid layout
- Smooth transitions and hover effects
- Variables for colors
- Modern typography
- Keep CSS minimal yet elegant.

HTML structure:
${html.slice(0, 8000)}  <!-- partial context only -->
`;

    const res = await this.client.chat.completions.create({
      model: 'gpt-4.1',
      temperature: 0.6,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: 'You are a CSS expert generating clean responsive CSS only.' },
        { role: 'user', content: prompt },
      ],
    });

    const css = res.choices?.[0]?.message?.content?.trim() || '';
    if (!css.includes('{')) throw new Error('Invalid CSS output.');
    return css.replace(/```css|```/g, '').trim();
  }

  async generateWebsiteJS(html: string): Promise<string> {
    this.logger.log(`⚡ Generating frontend interactivity script...`);

    const prompt = `
Create vanilla JavaScript for the following HTML to add:
- Smooth scrolling
- Mobile nav toggle
- Active link highlight
- Scroll animations
- Form validation
Return only valid JS (no HTML or CSS).

HTML (truncated):
${html.slice(0, 8000)}
`;

    const res = await this.client.chat.completions.create({
      model: 'gpt-4.1',
      temperature: 0.7,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: 'You are a JavaScript developer writing browser-safe vanilla JS only.' },
        { role: 'user', content: prompt },
      ],
    });

    const js = res.choices?.[0]?.message?.content?.trim() || '';
    if (!js.includes('document.')) throw new Error('Invalid JS output.');
    return js.replace(/```js|```javascript|```/g, '').trim();
  }


  async combineWebsiteAssets(html: string, css: string, js: string): Promise<string> {
    this.logger.log(`🧩 Combining generated HTML, CSS, and JS...`);

    return html
      .replace('</head>', `<style>\n${css}\n</style>\n</head>`)
      .replace('</body>', `<script>\n${js}\n</script>\n</body>`);
  }


  /**
   * Generate website and save to file system
   */
  async generateAndSaveWebsite(
    input: WebsiteGenerationInput,
    userId: string
  ): Promise<{ html: string; filePath: string; url: string }> {
    this.logger.log(`💾 Generating and saving website for user: ${userId}`);

    const html = await this.generateWebsiteHTML(input);
    const css = await this.generateWebsiteCSS(html, input.colorScheme);
    const js = await this.generateWebsiteJS(html);

    const finalSite = await this.combineWebsiteAssets(html, css, js);
    this.logger.log(`✅ Full website generated successfully for ${input.businessName}`);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedBusinessName = input.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const filename = `${sanitizedBusinessName}-${timestamp}.html`;
    const filePath = `websites/${userId}/${filename}`;

    // ✅ Ensure directory exists
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // ✅ Write HTML content to file
    await fs.writeFile(fullPath, finalSite, 'utf-8');
    this.logger.log(`✅ HTML file created at: ${fullPath}`);

    // ✅ Generate public URL (for example if served from /public)
    const publicUrl = `${process.env.PUBLIC_URL || 'https://yourdomain.com'}/${filePath}`;

    return {
      html: finalSite,
      filePath,
      url: publicUrl,
    };
  }

  /**
   * Validate generated HTML
   */
  private validateHTML(html: string): boolean {
    const requiredElements = [
      '<!DOCTYPE html>',
      '<html',
      '<head>',
      '<body>',
      '<nav',
      '<footer>',
      '<style>',
      '<script>',
    ];

    return requiredElements.every(element => html.includes(element));
  }

  /**
   * Extract sections from HTML for preview
   */
  extractSections(html: string): string[] {
    const sectionRegex = /<section[^>]*id="([^"]*)"[^>]*>/g;
    const sections: string[] = [];
    let match;

    while ((match = sectionRegex.exec(html)) !== null) {
      sections.push(match[1]);
    }

    return sections;
  }

  /**
   * Regenerate specific section of an existing website
   */
  async regenerateSection(
    originalHtml: string,
    sectionId: string,
    input: WebsiteGenerationInput
  ): Promise<string> {
    this.logger.log(`🔄 Regenerating section: ${sectionId}`);

    const prompt = `
You are an expert web developer. 

Given the following HTML website, regenerate ONLY the section with id="${sectionId}" while maintaining the same style and structure as the rest of the website.

Business Context:
- Business Name: ${input.businessName}
- Industry: ${input.industry}
- Tagline: ${input.tagline}

Original Website HTML:
${originalHtml}

Requirements:
1. Keep the same CSS classes and structure
2. Match the existing design style
3. Return ONLY the updated <section id="${sectionId}">...</section> element
4. Include all inner HTML content
5. Ensure images use Picsum Photos format
6. Use professional, realistic content

Return ONLY the section HTML, nothing else.
`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert web developer who modifies HTML sections professionally.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const newSection = response.choices?.[0]?.message?.content?.trim() || '';

    // Replace the old section with the new one
    const sectionRegex = new RegExp(
      `<section[^>]*id="${sectionId}"[^>]*>.*?</section>`,
      'gs'
    );

    const updatedHtml = originalHtml.replace(sectionRegex, newSection);

    this.logger.log(`✅ Section regenerated: ${sectionId}`);

    return updatedHtml;
  }
}