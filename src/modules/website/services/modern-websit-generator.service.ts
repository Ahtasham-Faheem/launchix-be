import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

// Import all type definitions
import {
    DesignConfig,
    NavigationConfig,
    FooterConfig,
    SEOConfig,
    AnimationConfig,
    SectionConfig,
    GeneratedContent,
    ImageAsset,
    WebsiteGenerationInput,
    GenerationResult,
    DEFAULT_NAVIGATION,
    DEFAULT_FOOTER,
    DEFAULT_SEO,
    DEFAULT_ANIMATIONS,
} from '../interfaces/types';

@Injectable()
export class ModernWebsiteGeneratorService {
    private readonly logger = new Logger(ModernWebsiteGeneratorService.name);
    private readonly client: OpenAI;
    private readonly outputDir: string;

    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.outputDir = path.join(process.cwd(), 'generated-websites');
    }

    /**
     * Main entry point - Generate complete website
     */
    async generateCompleteWebsite(input: WebsiteGenerationInput): Promise<GenerationResult> {
        const startTime = Date.now();
        this.logger.log(`🚀 Starting generation for: ${input.businessName}`);

        try {
            // Step 1: Create Design JSON
            this.logger.log('🎯 Step 1/7: Creating design JSON...');
            const designJSON = await this.createDesignJSON(input);
            await this.saveJSON('01-design.json', designJSON);

            // Step 2: Generate Content
            this.logger.log('📝 Step 2/7: Generating content...');
            const contentJSON = await this.generateAllContent(designJSON);
            await this.saveJSON('02-content.json', contentJSON);

            // Step 2.5: Generate Images
            this.logger.log('🖼️  Step 2.5/7: Assigning images...');
            const imagesJSON = await this.generateAllImages(contentJSON);
            await this.saveJSON('03-images.json', imagesJSON);

            // Step 3: Generate HTML
            this.logger.log('📄 Step 3/7: Generating HTML...');
            const html = await this.generateHTML(imagesJSON);
            await this.saveFile('04-generated.html', html);

            // Step 4: Generate CSS
            this.logger.log('🎨 Step 4/7: Generating CSS...');
            const css = await this.generateCSS(html, imagesJSON);
            await this.saveFile('05-generated.css', css);

            // Step 5: Generate JavaScript
            this.logger.log('⚡ Step 5/7: Generating JavaScript...');
            const js = await this.generateJavaScript(html, imagesJSON);
            await this.saveFile('06-generated.js', js);

            // Step 6: Combine Assets
            this.logger.log('🔧 Step 6/7: Combining assets...');
            const combined = await this.combineAssets(html, css, js, imagesJSON);
            await this.saveFile('07-combined.html', combined);

            // Step 7: Optimize
            this.logger.log('🚀 Step 7/7: Optimizing...');
            const optimized = await this.optimizeFinalWebsite(combined);
            await this.saveFile('08-final.html', optimized.html);

            // Save to public directory
            const { url, filePath } = await this.saveToPublic(optimized.html, input);

            const duration = Date.now() - startTime;
            this.logger.log(`✅ Generation complete in ${duration}ms`);

            return {
                html: optimized.html,
                url,
                filePath,
                stats: {
                    duration,
                    size: optimized.size,
                    sections: input.sections.length,
                },
                metadata: {
                    designJSON: imagesJSON,
                },
            };
        } catch (error) {
            this.logger.error(`❌ Generation failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Step 1: Create comprehensive design JSON
     */
    private async createDesignJSON(input: WebsiteGenerationInput): Promise<DesignConfig> {
        const designJSON: DesignConfig = {
            metadata: {
                projectName: input.businessName,
                industry: input.industry,
                targetAudience: `${input.industry} customers`,
                tone: 'Professional, Modern, Innovative',
                primaryCTA: 'Get Started',
                secondaryCTA: 'Learn More',
            },

            branding: {
                businessName: input.businessName,
                tagline: input.tagline,
                logoUrl: input.logoUrl || '/images/logo.png',
            },

            colorScheme: {
                primary: input.colorScheme.primary || '#3B82F6',
                secondary: input.colorScheme.secondary || '#8B5CF6',
                accent: input.colorScheme.accent || '#F59E0B',
                background: input.colorScheme.background || '#FFFFFF',
                backgroundAlt: input.colorScheme.backgroundAlt || '#F9FAFB',
                text: input.colorScheme.text || '#1F2937',
                textLight: input.colorScheme.textLight || '#6B7280',
            },

            typography: input.customization?.typography || {
                headingFont: 'Poppins',
                bodyFont: 'Inter',
                fontWeights: {
                    light: 300,
                    regular: 400,
                    medium: 500,
                    semibold: 600,
                    bold: 700,
                    extrabold: 800,
                },
            },

            spacing: {
                unit: 8,
                scale: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
                values: [8, 16, 24, 32, 48, 64, 96, 128],
            },

            sections: this.createSectionConfigs(input.sections, input.industry),

            navigation: this.createNavigationConfig(input),

            footer: this.createFooterConfig(input),

            seo: this.createSEOConfig(input),

            animations: input.customization?.animations || DEFAULT_ANIMATIONS,
        };

        return designJSON;
    }

    /**
     * Create navigation configuration
     */
    private createNavigationConfig(input: WebsiteGenerationInput): NavigationConfig {
        const customNav = input.customization?.navigation || {};

        return {
            ...DEFAULT_NAVIGATION,
            ...customNav,
            items: input.sections.map(section => ({
                label: section,
                link: `#${section.toLowerCase().replace(/\s+/g, '-')}`,
            })),
            cta: {
                text: 'Get Started',
                link: '#contact',
                style: 'primary',
            },
        };
    }

    /**
     * Create footer configuration
     */
    private createFooterConfig(input: WebsiteGenerationInput): FooterConfig {
        const customFooter = input.customization?.footer || {};

        return {
            ...DEFAULT_FOOTER,
            ...customFooter,
            columns: [
                {
                    title: 'Company',
                    links: [
                        { label: 'About Us', link: '#about' },
                        { label: 'Careers', link: '#careers' },
                        { label: 'Blog', link: '#blog' },
                        { label: 'Contact', link: '#contact' },
                    ],
                },
                {
                    title: 'Product',
                    links: [
                        { label: 'Features', link: '#features' },
                        { label: 'Pricing', link: '#pricing' },
                        { label: 'Integrations', link: '#integrations' },
                    ],
                },
                {
                    title: 'Resources',
                    links: [
                        { label: 'Documentation', link: '#docs' },
                        { label: 'Support', link: '#support' },
                        { label: 'API', link: '#api' },
                    ],
                },
                {
                    title: 'Legal',
                    links: [
                        { label: 'Privacy Policy', link: '#privacy' },
                        { label: 'Terms of Service', link: '#terms' },
                        { label: 'Cookies', link: '#cookies' },
                    ],
                },
            ],
            bottom: {
                show: true,
                copyright: `© ${new Date().getFullYear()} ${input.businessName}. All rights reserved.`,
                layout: 'split',
                links: [
                    { label: 'Privacy Policy', link: '#privacy' },
                    { label: 'Terms of Service', link: '#terms' },
                ],
            },
        };
    }

    /**
     * Create SEO configuration
     */
    private createSEOConfig(input: WebsiteGenerationInput): SEOConfig {
        const customSEO = input.customization?.seo || {};

        return {
            ...DEFAULT_SEO,
            ...customSEO,
            title: `${input.businessName} - ${input.tagline}`,
            description: `${input.tagline}. Leading ${input.industry} solutions for modern businesses.`,
            keywords: [input.businessName, input.industry, 'professional services', 'solutions'],
            author: input.businessName,
        };
    }

    /**
     * Create section configurations
     */
    private createSectionConfigs(sections: string[], industry: string): SectionConfig[] {
        const configs: SectionConfig[] = [];

        sections.forEach(section => {
            const sectionId = section.toLowerCase().replace(/\s+/g, '-');

            switch (sectionId) {
                case 'hero':
                    configs.push({
                        id: 'hero',
                        type: 'hero',
                        enabled: true,
                        layout: 'split',
                        settings: {
                            fullHeight: true,
                            backgroundType: 'gradient',
                            showTrustBadges: true,
                        },
                        content: {
                            trustBadges: [
                                { icon: 'fa-users', value: '10,000+', label: 'Active Users' },
                                { icon: 'fa-star', value: '4.9/5', label: 'Rating' },
                                { icon: 'fa-shield-check', value: '99.9%', label: 'Uptime' },
                            ],
                            image: { required: true, type: 'hero', size: '1200x800' },
                        },
                    });
                    break;

                case 'features':
                case 'services':
                    configs.push({
                        id: sectionId,
                        type: 'features',
                        enabled: true,
                        layout: 'grid',
                        settings: {
                            columns: { desktop: 3, tablet: 2, mobile: 1 },
                            cardStyle: 'elevated',
                        },
                        content: {
                            features: Array(6)
                                .fill(null)
                                .map((_, i) => ({
                                    icon: this.getFeatureIcon(i),
                                    title: '',
                                    description: '',
                                })),
                        },
                    });
                    break;

                case 'testimonials':
                case 'reviews':
                    configs.push({
                        id: 'testimonials',
                        type: 'testimonials',
                        enabled: true,
                        layout: 'grid',
                        settings: {
                            columns: { desktop: 3, tablet: 2, mobile: 1 },
                            showRating: true,
                        },
                        content: {
                            testimonials: Array(6)
                                .fill(null)
                                .map(() => ({
                                    rating: 5,
                                    quote: '',
                                    author: { name: '', role: '', company: '' },
                                    image: { required: true, type: 'avatar', size: '80x80' },
                                })),
                        },
                    });
                    break;

                case 'pricing':
                    configs.push({
                        id: 'pricing',
                        type: 'pricing',
                        enabled: true,
                        layout: 'cards',
                        settings: {
                            highlightPopular: true,
                        },
                        content: {
                            plans: [
                                { name: 'Basic', price: 29, features: [], popular: false },
                                { name: 'Professional', price: 79, features: [], popular: true },
                                { name: 'Enterprise', price: 199, features: [], popular: false },
                            ],
                        },
                    });
                    break;

                case 'contact':
                    configs.push({
                        id: 'contact',
                        type: 'contact',
                        enabled: true,
                        layout: 'split',
                        settings: {
                            showMap: false,
                            showSocial: true,
                        },
                        content: {
                            contactInfo: {
                                email: 'hello@company.com',
                                phone: '+1 (555) 123-4567',
                                address: '123 Business St, City, State 12345',
                            },
                            form: {
                                fields: [
                                    { name: 'name', type: 'text', label: 'Full Name', required: true },
                                    { name: 'email', type: 'email', label: 'Email', required: true },
                                    { name: 'message', type: 'textarea', label: 'Message', required: true },
                                ],
                            },
                        },
                    });
                    break;

                default:
                    configs.push({
                        id: sectionId,
                        type: 'generic',
                        enabled: true,
                        layout: 'standard',
                        settings: {},
                        content: {},
                    });
            }
        });

        return configs;
    }

    private getFeatureIcon(index: number): string {
        const icons = ['fa-rocket', 'fa-shield-alt', 'fa-cog', 'fa-chart-line', 'fa-users', 'fa-award'];
        return icons[index % icons.length];
    }

    /**
     * Step 2: Generate content for all sections
     */
    private async generateAllContent(designJSON: DesignConfig): Promise<DesignConfig> {
        const updatedSections: SectionConfig[] = [];

        for (const section of designJSON.sections) {
            if (!section.enabled) {
                updatedSections.push(section);
                continue;
            }

            this.logger.log(`  Generating content for: ${section.id}`);
            const content = await this.generateSectionContent(section, designJSON.metadata);

            updatedSections.push({
                ...section,
                content: {
                    ...section.content,
                    ...content,
                },
            });

            await this.sleep(500);
        }

        return {
            ...designJSON,
            sections: updatedSections,
        };
    }

    private async generateSectionContent(
        section: SectionConfig,
        metadata: DesignConfig['metadata']
    ): Promise<GeneratedContent> {
        const prompt = this.createContentPrompt(section, metadata);

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o',
                temperature: 0.8,
                // max_tokens: 1500,
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are an expert copywriter. Output ONLY valid JSON with no markdown formatting.',
                    },
                    { role: 'user', content: prompt },
                ],
            });

            const content = response.choices[0].message.content.trim();
            const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            return JSON.parse(cleanContent);
        } catch (error) {
            this.logger.error(`Failed to generate content for ${section.id}: ${error.message}`);
            return this.getDefaultContent(section.type);
        }
    }

    private createContentPrompt(section: SectionConfig, metadata: DesignConfig['metadata']): string {
        // Same as before - omitted for brevity
        return `Generate content for ${section.type}...`;
    }

    private getDefaultContent(type: string): GeneratedContent {
        return {
            headline: 'Transform Your Business',
            subheadline: 'Leading solutions for modern companies',
            description: 'Discover innovative solutions.',
        };
    }

    /**
     * Step 2.5: Generate/assign images
     */
    private async generateAllImages(contentJSON: DesignConfig): Promise<DesignConfig> {
        const seeds = this.generateImageSeeds(50);
        let seedIndex = 0;

        const updatedSections = contentJSON.sections.map(section => {
            const images: ImageAsset[] = [];

            if (section.type === 'hero' && section.content.image) {
                images.push({
                    type: 'hero',
                    url: `https://picsum.photos/1200/800?random=${seeds[seedIndex++]}`,
                    alt: `${contentJSON.branding.businessName} hero image`,
                    width: 1200,
                    height: 800,
                });
            }

            if (section.type === 'testimonials' && section.content.testimonials) {
                section.content.testimonials = section.content.testimonials.map((testimonial: any) => ({
                    ...testimonial,
                    avatar: {
                        url: `https://picsum.photos/80/80?random=${seeds[seedIndex++]}`,
                        alt: `${testimonial.author?.name || 'Customer'} avatar`,
                        width: 80,
                        height: 80,
                    },
                }));
            }

            return {
                ...section,
                content: {
                    ...section.content,
                    images,
                },
            };
        });

        return {
            ...contentJSON,
            sections: updatedSections,
        };
    }

    private generateImageSeeds(count: number): number[] {
        return Array.from({ length: count }, () => Math.floor(Math.random() * 10000) + 1000);
    }

    async generateHTML(designJSON: DesignConfig): Promise<string> {
        this.logger.log('📄 Step 3: Generating HTML structure...');

        const prompt = this.createHTMLPrompt(designJSON);

        const response = await this.client.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0.8, // Increased for more creativity
            messages: [
                {
                    role: 'system',
                    content: `You are an ELITE web designer specializing in STUNNING, MODERN, EYE-CATCHING websites.

CRITICAL MISSION:
Create a website that makes people say "WOW!" - unique, memorable, and visually striking.

YOUR EXPERTISE:
✨ 2024-2025 cutting-edge design trends
🎨 Creative, asymmetric layouts (NOT generic templates)
💎 Premium, high-end aesthetics
🚀 Bold typography and visual hierarchy
🎭 Industry-specific design language
🌟 Micro-interactions and delightful details

ABSOLUTE RULES:
1. Output ONLY HTML code (no markdown, no explanations, no comments)
2. Start with <!DOCTYPE html>
3. Use exact section IDs from design JSON
4. BEM naming convention (block__element--modifier)
5. ONE h1 tag only (in hero section)
6. Semantic HTML5: <header>, <nav>, <main>, <section>, <footer>
7. NO <style> or <script> tags
8. Include data-aos attributes for smooth animations
9. Add decorative elements (blobs, shapes, lines) for visual interest
10. Use creative layouts - asymmetric, overlapping, dynamic
11. Include ALL content from JSON
12. Modern HTML patterns: <picture>, semantic tags, ARIA labels

DESIGN PHILOSOPHY:
- Break the grid intelligently
- Use white space creatively
- Add depth with layering
- Create visual rhythm
- Make every section unique
- Think Apple, Stripe, Linear - that level of polish`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        let html = response.choices[0].message.content.trim();
        html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

        await this.validateHTML(html);
        await this.saveFile('04-generated.html', html);

        return html;
    }

    private createHTMLPrompt(designJSON: DesignConfig): string {
        return `
═══════════════════════════════════════════════════════════════════
🎨 CREATE A STUNNING, MODERN, EYE-CATCHING WEBSITE
═══════════════════════════════════════════════════════════════════

Industry: ${designJSON.metadata.industry}
Vibe: ${designJSON.metadata.tone}
Business: ${designJSON.branding.businessName}

THIS DESIGN MUST:
✨ Look like it was made in 2024-2025 (cutting-edge, not dated)
🎯 Be UNIQUE - no generic templates or boring layouts
💎 Have PREMIUM feel - high-end, polished, professional
🌟 Be EYE-CATCHING - make visitors say "wow!"
🎭 Reflect ${designJSON.metadata.industry} industry aesthetics

═══════════════════════════════════════════════════════════════════
🎨 DESIGN SYSTEM
═══════════════════════════════════════════════════════════════════

Colors: ${JSON.stringify(designJSON.colorScheme, null, 2)}
Typography: ${JSON.stringify(designJSON.typography, null, 2)}
Animations: ${JSON.stringify(designJSON.animations.defaults, null, 2)}

═══════════════════════════════════════════════════════════════════
🏗️ CREATIVE LAYOUT PRINCIPLES (APPLY TO EVERY SECTION)
═══════════════════════════════════════════════════════════════════

**HERO SECTION** - First Impression = STUNNING:
- Asymmetric layout (60/40 split, NOT centered)
- Massive, bold headline with creative line breaks
- Text overlapping images (z-index layering)
- Floating decorative elements (blobs, shapes, gradients)
- Creative CTA buttons (gradient borders, glowing effects, not boring)
- Add: <div class="blob blob--hero"></div> for background decoration
- Height: min-height: 92vh with content vertically centered
- Include trust badges as floating cards

**FEATURES/SERVICES** - Beyond Standard Cards:
- Staggered/masonry grid (not perfect alignment)
- Cards with unique shapes: rounded corners (24px+), tilted (rotate: 2deg)
- Glassmorphism effects (backdrop-filter: blur(10px))
- Icons in colored circles with soft shadows
- Hover: lift effect (transform: translateY(-8px))
- Add decorative elements between cards

**CONTENT SECTIONS** - Break the Mold:
- Zigzag layouts (alternate image-text sides)
- Diagonal section dividers (use clip-path or SVG)
- Text blocks with decorative lines/dots on sides
- Full-width images with overlaid text
- Organic shapes (border-radius: 30% 70% 70% 30%)
- Add: <div class="pattern-overlay"></div> for texture

**TESTIMONIALS** - Memorable Social Proof:
- Masonry layout or 3-column grid with varying heights
- Large quotation marks as design elements (decorative)
- Profile images: hexagonal or with creative masks
- 5-star ratings with accent color
- Verified badges with icons
- Soft shadows and subtle gradients on cards

**PRICING** - Clear & Attractive:
- 3 tiers with middle one ELEVATED (scale: 1.05, shadow-xl)
- Gradient borders on featured plan
- Checkmarks with accent color (not boring bullets)
- "Most Popular" badge with gradient
- Hover: glow effect or border animation
- Clear visual hierarchy

**CONTACT/FOOTER** - Strong Finish:
- Footer with gradient or pattern background
- Large, readable typography
- Creative icon placement
- Newsletter signup: full-width bar with rounded input + button
- Wave divider above footer (SVG or clip-path)

═══════════════════════════════════════════════════════════════════
✨ DECORATIVE ELEMENTS TO ADD (For Visual Interest)
═══════════════════════════════════════════════════════════════════

Sprinkle these throughout for uniqueness:

<!-- Gradient Blobs (add 2-3 per major section) -->
<div class="blob blob--primary" style="top: 10%; left: -5%;"></div>
<div class="blob blob--secondary" style="bottom: 15%; right: -10%;"></div>

<!-- Decorative Shapes -->
<div class="shape shape--circle" style="top: 20%; right: 5%;"></div>
<div class="shape shape--dots" style="bottom: 30%; left: 10%;"></div>

<!-- Accent Lines -->
<div class="accent-line accent-line--vertical"></div>
<div class="accent-line accent-line--horizontal"></div>

<!-- Pattern Overlays -->
<div class="pattern-overlay pattern--dots"></div>
<div class="pattern-overlay pattern--grid"></div>

These will be styled in CSS for subtle background effects.

═══════════════════════════════════════════════════════════════════
🎯 MODERN HTML PATTERNS TO USE
═══════════════════════════════════════════════════════════════════

**Navigation:**
<nav class="navbar" role="navigation">
  <div class="navbar__container">
    <a href="#hero" class="navbar__logo">
      <img src="${designJSON.branding.logoUrl}" alt="${designJSON.branding.businessName}">
    </a>
    <ul class="navbar__menu">
      ${designJSON.navigation.items.map(item =>
            `<li class="navbar__item"><a href="${item.link}" class="navbar__link">${item.label}</a></li>`
        ).join('\n      ')}
    </ul>
    <button class="navbar__toggle" aria-label="Toggle menu">
      <span class="navbar__toggle-line"></span>
      <span class="navbar__toggle-line"></span>
      <span class="navbar__toggle-line"></span>
    </button>
    <a href="#contact" class="btn btn--primary navbar__cta">Get Started</a>
  </div>
</nav>

**Hero Pattern:**
<section id="hero" class="hero-section">
  <div class="hero-section__container">
    <div class="hero-section__content" data-aos="fade-right">
      <h1 class="hero-section__headline">
        <span class="gradient-text">${designJSON.sections[0]?.content?.headline || designJSON.branding.tagline}</span>
      </h1>
      <p class="hero-section__subheadline">[Subheadline]</p>
      <p class="hero-section__description">[Description]</p>
      <div class="hero-section__buttons">
        <a href="#contact" class="btn btn--primary btn--large">
          <span>Get Started</span>
          <i class="fas fa-arrow-right"></i>
        </a>
        <a href="#features" class="btn btn--secondary btn--large">
          <span>Learn More</span>
        </a>
      </div>
      <div class="hero-section__trust-badges">
        <div class="trust-badge">
          <i class="fas fa-users"></i>
          <span class="trust-badge__number">10,000+</span>
          <span class="trust-badge__label">Users</span>
        </div>
        <!-- More badges -->
      </div>
    </div>
    <div class="hero-section__visual" data-aos="fade-left" data-aos-delay="200">
      <img src="[hero-image]" alt="..." class="hero-section__image">
      <div class="blob blob--hero-accent"></div>
    </div>
  </div>
  <!-- Decorative elements -->
  <div class="blob blob--primary"></div>
  <div class="shape shape--circle"></div>
</section>

**Feature Cards Pattern:**
<div class="feature-card" data-aos="fade-up" data-aos-delay="[stagger]">
  <div class="feature-card__icon">
    <i class="fas fa-[icon-name]"></i>
  </div>
  <h3 class="feature-card__title">[Title]</h3>
  <p class="feature-card__description">[Description]</p>
  <a href="#" class="feature-card__link">
    Learn more <i class="fas fa-arrow-right"></i>
  </a>
</div>

**Testimonial Card Pattern:**
<div class="testimonial-card" data-aos="zoom-in">
  <div class="testimonial-card__rating">
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
  </div>
  <blockquote class="testimonial-card__quote">"[Quote]"</blockquote>
  <div class="testimonial-card__author">
    <img src="[avatar]" alt="..." class="testimonial-card__avatar">
    <div class="testimonial-card__author-info">
      <h4 class="testimonial-card__name">[Name]</h4>
      <p class="testimonial-card__role">[Role] at [Company]</p>
    </div>
  </div>
  <div class="testimonial-card__verified">
    <i class="fas fa-check-circle"></i> Verified Customer
  </div>
</div>

═══════════════════════════════════════════════════════════════════
📐 SECTIONS TO CREATE (Use these exact IDs)
═══════════════════════════════════════════════════════════════════

${designJSON.sections.map(section => `
**${section.id.toUpperCase()} SECTION** (id="${section.id}", class="${section.id}-section"):
- Type: ${section.type}
- Layout: ${section.layout}
- Make it unique and memorable
- Use creative positioning and spacing
- Add decorative elements
- Include all content from JSON
`).join('\n')}

═══════════════════════════════════════════════════════════════════
📊 CONTENT (Use ALL of this)
═══════════════════════════════════════════════════════════════════

COMPLETE DESIGN SPECIFICATION:
${JSON.stringify(designJSON, null, 2)}

**Extract and use:**
- All headlines, subheadlines, descriptions
- All features, benefits, services
- All testimonials with names and companies
- All pricing plans with features
- Contact information
- All images with descriptive alt text
- Logo: ${designJSON.branding.logoUrl}

═══════════════════════════════════════════════════════════════════
🎯 SEO & META (Required in <head>)
═══════════════════════════════════════════════════════════════════

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${designJSON.seo.title}</title>
  <meta name="description" content="${designJSON.seo.description}">
  <meta name="keywords" content="${designJSON.seo.keywords.join(', ')}">
  <meta property="og:title" content="${designJSON.seo.title}">
  <meta property="og:description" content="${designJSON.seo.description}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "${designJSON.branding.businessName}",
    "url": "https://example.com"
  }
  </script>
</head>

═══════════════════════════════════════════════════════════════════
✅ FINAL CHECKLIST
═══════════════════════════════════════════════════════════════════

✓ Modern, unique, eye-catching design
✓ Creative layouts (not generic)
✓ Decorative elements throughout
✓ BEM class naming
✓ ONE h1 tag
✓ Semantic HTML5
✓ Data-aos attributes
✓ All content from JSON
✓ NO <style> or <script>
✓ Complete and valid HTML

═══════════════════════════════════════════════════════════════════

🚀 GENERATE THE STUNNING HTML NOW!

Output ONLY the complete HTML code.
No explanations. No markdown. No code blocks.
Start with <!DOCTYPE html> and end with </html>.
Make it UNFORGETTABLE! 🌟
`;
    }

    private async validateHTML(html: string): Promise<void> {
        const checks = {
            hasDoctype: html.includes('<!DOCTYPE html>'),
            hasHead: html.includes('<head>') && html.includes('</head>'),
            hasBody: html.includes('<body>') && html.includes('</body>'),
            h1Count: (html.match(/<h1/g) || []).length === 1,
        };

        const failed = Object.entries(checks).filter(([_, passed]) => !passed);

        if (failed.length > 0) {
            this.logger.warn(`⚠️  HTML validation warnings: ${failed.map(([k]) => k).join(', ')}`);
        }
    }

    // ========================================
    // STEP 4: GENERATE CSS
    // ========================================

    async generateCSS(html: string, designJSON: DesignConfig): Promise<string> {
        this.logger.log('🎨 Step 4: Generating CSS styles...');

        const prompt = this.createCSSPrompt(html, designJSON);

        const response = await this.client.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0.7, // Increased for creativity
            messages: [
                {
                    role: 'system',
                    content: `You are an ELITE CSS designer creating STUNNING, MODERN stylesheets that make websites UNFORGETTABLE.

YOUR MISSION:
Create CSS that transforms HTML into a visual masterpiece - polished, professional, and eye-catching.

YOUR EXPERTISE:
✨ 2024-2025 CSS trends (container queries, :has(), modern features)
🎨 Micro-animations and delightful interactions
💎 Glassmorphism, gradients, shadows, and depth
🚀 Smooth transitions and hover effects
🎭 Industry-specific color psychology
🌟 Creative layouts with CSS Grid and Flexbox

ABSOLUTE RULES:
1. Output ONLY CSS code (no explanations, no comments)
2. Match HTML class names EXACTLY (BEM methodology)
3. Use CSS variables for ALL design tokens
4. Mobile-first responsive design (320px → 1920px)
5. Modern CSS: Grid, Flexbox, clamp(), min(), max()
6. Smooth transitions on ALL interactive elements
7. Creative hover effects (lift, glow, scale, rotate)
8. Style EVERY class from HTML
9. Add depth with shadows and layering
10. Use gradients creatively
11. Professional, polished appearance

CSS PHILOSOPHY:
- Every interaction should feel delightful
- Use micro-animations (subtle, not distracting)
- Create depth with shadows and z-index
- Perfect spacing using 8px grid system
- Smooth, butter-like transitions
- Think Apple, Stripe, Linear level of polish`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        let css = response.choices[0].message.content.trim();
        css = css.replace(/```css\n?/g, '').replace(/```\n?/g, '').trim();

        await this.saveFile('05-generated.css', css);

        return css;
    }

    private createCSSPrompt(html: string, designJSON: DesignConfig): string {
        return `
═══════════════════════════════════════════════════════════════════
🎨 CREATE STUNNING, MODERN CSS - MAKE IT UNFORGETTABLE
═══════════════════════════════════════════════════════════════════

Industry: ${designJSON.metadata.industry}
Brand Personality: ${designJSON.metadata.tone}

THIS CSS MUST:
✨ Look ultra-modern (2024-2025 trends)
💎 Feel premium and polished
🌟 Have delightful micro-interactions
🎯 Style EVERY class from the HTML perfectly
🎭 Use colors to evoke the right emotions
🚀 Be smooth and performant

═══════════════════════════════════════════════════════════════════
🎨 DESIGN SYSTEM (Use these EXACTLY)
═══════════════════════════════════════════════════════════════════

**Colors:**
${JSON.stringify(designJSON.colorScheme, null, 2)}

**Typography:**
${JSON.stringify(designJSON.typography, null, 2)}

**Spacing:** 8px base unit
${JSON.stringify(designJSON.spacing, null, 2)}

**Animations:**
Duration: ${designJSON.animations.defaults.duration}ms
Easing: ${designJSON.animations.defaults.easing}

═══════════════════════════════════════════════════════════════════
🎨 CSS VARIABLES (Define in :root)
═══════════════════════════════════════════════════════════════════

:root {
  /* Colors */
  --color-primary: ${designJSON.colorScheme.primary};
  --color-secondary: ${designJSON.colorScheme.secondary};
  --color-accent: ${designJSON.colorScheme.accent};
  --color-background: ${designJSON.colorScheme.background};
  --color-text: ${designJSON.colorScheme.text};
  --color-text-light: ${designJSON.colorScheme.textLight || '#6B7280'};
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, ${designJSON.colorScheme.primary}, ${designJSON.colorScheme.secondary});
  --gradient-accent: linear-gradient(135deg, ${designJSON.colorScheme.accent}, ${designJSON.colorScheme.primary});
  --gradient-hero: linear-gradient(135deg, ${designJSON.colorScheme.primary}15, ${designJSON.colorScheme.secondary}15);
  
  /* Shadows (create depth) */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 50px rgba(0, 0, 0, 0.15);
  --shadow-glow: 0 0 30px ${designJSON.colorScheme.primary}40;
  
  /* Spacing */
  --spacing-unit: 8px;
  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 32px;
  --spacing-xl: 48px;
  --spacing-2xl: 64px;
  --spacing-3xl: 96px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Typography */
  --font-heading: '${designJSON.typography.headingFont}', serif;
  --font-body: '${designJSON.typography.bodyFont}', sans-serif;
  
  /* Z-index layers */
  --z-decorative: -1;
  --z-base: 1;
  --z-elevated: 10;
  --z-sticky: 100;
  --z-navbar: 1000;
  --z-modal: 9999;
}

═══════════════════════════════════════════════════════════════════
🎨 MODERN CSS PATTERNS TO USE
═══════════════════════════════════════════════════════════════════

**1. GLASSMORPHISM:**
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

**2. GRADIENT TEXT:**
.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

**3. SMOOTH HOVER EFFECTS:**
.card {
  transition: all var(--transition-normal);
}
.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

**4. DECORATIVE BLOBS:**
.blob {
  position: absolute;
  width: 500px;
  height: 500px;
  background: var(--gradient-primary);
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  opacity: 0.1;
  filter: blur(60px);
  z-index: var(--z-decorative);
  animation: blob-float 20s infinite ease-in-out;
}

@keyframes blob-float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(30px, -30px) rotate(180deg); }
}

**5. MODERN BUTTONS:**
.btn {
  padding: 14px 32px;
  border-radius: var(--radius-lg);
  font-weight: 600;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.btn--primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}

**6. FLOATING ANIMATION:**
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.floating {
  animation: float 3s ease-in-out infinite;
}

═══════════════════════════════════════════════════════════════════
📐 RESPONSIVE DESIGN (Mobile-First)
═══════════════════════════════════════════════════════════════════

/* Base: Mobile (320px+) */
body { font-size: 16px; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  body { font-size: 17px; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  body { font-size: 18px; }
}

/* Wide Desktop (1440px+) */
@media (min-width: 1440px) {
  .container { max-width: 1320px; }
}

═══════════════════════════════════════════════════════════════════
🎯 SECTION-SPECIFIC STYLES (Style EVERY class from HTML)
═══════════════════════════════════════════════════════════════════

**NAVBAR:**
- Fixed top with backdrop-filter blur
- On scroll: add background and shadow
- Mobile: hamburger menu
- Smooth transitions

**HERO:**
- Full viewport height (min-height: 92vh)
- Asymmetric grid layout
- Large, bold typography
- Gradient text on headline
- CTA buttons with glow on hover
- Floating elements animation

**CARDS (Features, Services, Testimonials):**
- Grid layout with gap
- Soft shadows
- Hover: lift and glow
- Border-radius: var(--radius-lg)
- Staggered animation delays

**FORMS:**
- Modern inputs with focus effects
- Floating labels
- Validation states
- Smooth transitions

**FOOTER:**
- Gradient or pattern background
- Multi-column grid
- Newsletter with creative styling
- Wave divider above (if present in HTML)

═══════════════════════════════════════════════════════════════════
📊 HTML STRUCTURE (Style ALL these classes)
═══════════════════════════════════════════════════════════════════

${html}

[... HTML continues, style EVERY class ...]

═══════════════════════════════════════════════════════════════════
✅ CSS REQUIREMENTS CHECKLIST
═══════════════════════════════════════════════════════════════════

✓ CSS Variables for all design tokens
✓ Mobile-first responsive (320px → 1920px)
✓ Style EVERY class from HTML exactly
✓ Smooth transitions (300ms cubic-bezier)
✓ Hover effects on interactive elements
✓ Glassmorphism where appropriate
✓ Gradient text on headlines
✓ Decorative blob animations
✓ Modern shadows for depth
✓ Creative button styles
✓ Perfect spacing (8px grid)
✓ Fluid typography (clamp)
✓ Professional, polished look

═══════════════════════════════════════════════════════════════════

🚀 GENERATE THE STUNNING CSS NOW!

Output ONLY the complete CSS code.
No explanations. No comments. No markdown.
Style EVERY class. Make it UNFORGETTABLE! 🌟
`;
    }

    // ========================================
    // STEP 5: GENERATE JAVASCRIPT
    // ========================================

    async generateJavaScript(html: string, designJSON: DesignConfig): Promise<string> {
        this.logger.log('⚡ Step 5: Generating JavaScript interactions...');

        const prompt = this.createJavaScriptPrompt(html, designJSON);

        const response = await this.client.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0.7,
            // max_tokens: 8000,
            messages: [
                {
                    role: 'system',
                    content: `You are a JavaScript expert creating modern, performant interactions.

CRITICAL RULES:
1. Output ONLY JavaScript code (no markdown, no explanations)
2. Use exact class names from HTML (BEM)
3. Vanilla JavaScript (NO jQuery)
4. ES6+ features
5. Check if elements exist before manipulating
6. Performance optimized
7. Proper error handling`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        let js = response.choices[0].message.content.trim();
        js = js.replace(/```javascript\n?/g, '').replace(/```js\n?/g, '').replace(/```\n?/g, '').trim();

        await this.saveFile('06-generated.js', js);

        return js;
    }

    private createJavaScriptPrompt(html: string, designJSON: DesignConfig): string {
        return `
Generate PRODUCTION-READY JavaScript for interactive features.

HTML STRUCTURE (first 10000 chars):
${html}

REQUIRED FEATURES:
1. Smooth scroll navigation (sections: ${designJSON.sections.map(s => `#${s.id}`).join(', ')})
2. Mobile menu toggle (.navbar__toggle)
3. Active section highlighting (Intersection Observer)
4. Navbar scroll effect (.navbar--scrolled after 50px scroll)
5. Form validation (if contact form exists)
6. Counter animations for statistics
7. Scroll to top button
8. Lazy load images

ANIMATION LIBRARY: ${designJSON.animations.library}
Animation settings: ${JSON.stringify(designJSON.animations.defaults)}

Generate complete JavaScript. Output ONLY JavaScript code.
`;
    }

    // ========================================
    // STEP 6: COMBINE ASSETS
    // ========================================

    async combineAssets(
        html: string,
        css: string,
        js: string,
        designJSON: DesignConfig
    ): Promise<string> {
        this.logger.log('🔧 Step 6: Combining all assets...');

        const fonts = this.generateFontLinks(designJSON.typography);
        const utilityCSS = this.generateUtilityCSS(designJSON);

        // Inject CSS
        let finalHTML = html.replace(
            '</head>',
            `
  ${fonts}
  
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" />
  
  <!-- AOS Animation -->
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
  
  <!-- Custom Styles -->
  <style>
/* CSS Reset */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

body {
  font-family: '${designJSON.typography.bodyFont}', sans-serif;
  line-height: 1.6;
  color: ${designJSON.colorScheme.text};
  -webkit-font-smoothing: antialiased;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  text-decoration: none;
  color: inherit;
}

/* Generated Styles */
${css}

/* Utility Classes */
${utilityCSS}
  </style>
</head>`
        );

        // Inject JavaScript
        finalHTML = finalHTML.replace(
            '</body>',
            `
  <!-- AOS Animation -->
  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
  
  <!-- Custom JavaScript -->
  <script>
// Initialize AOS
if (typeof AOS !== 'undefined') {
  AOS.init(${JSON.stringify(designJSON.animations.defaults)});
}

// Generated JavaScript
(function() {
  'use strict';
  
${js}
  
})();
  </script>
</body>`
        );

        await this.saveFile('07-combined.html', finalHTML);

        return finalHTML;
    }

    private generateFontLinks(typography: DesignConfig['typography']): string {
        const weights = Object.values(typography.fontWeights).join(';');
        return `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${typography.headingFont}:wght@${weights}&family=${typography.bodyFont}:wght@${weights}&display=swap" rel="stylesheet">`;
    }

    private generateUtilityCSS(designJSON: DesignConfig): string {
        let css = '\n/* Utility Classes */\n';

        // Spacing utilities
        designJSON.spacing.scale.forEach((scale, index) => {
            const value = designJSON.spacing.values[index];
            css += `
.mt-${scale} { margin-top: ${value}px; }
.mb-${scale} { margin-bottom: ${value}px; }
.pt-${scale} { padding-top: ${value}px; }
.pb-${scale} { padding-bottom: ${value}px; }`;
        });

        // Scroll to top button
        css += `

.scroll-to-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${designJSON.colorScheme.primary};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s ease;
  z-index: 999;
}

.scroll-to-top--visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.scroll-to-top:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}`;

        return css;
    }

    // ========================================
    // STEP 7: OPTIMIZE
    // ========================================

    async optimizeFinalWebsite(html: string): Promise<{ html: string; size: number }> {
        this.logger.log('🚀 Step 7: Final optimization...');

        // Add performance hints
        const optimized = html.replace(
            '<head>',
            `<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">`
        );

        await this.saveFile('08-final.html', optimized);

        return {
            html: optimized,
            size: Buffer.byteLength(optimized),
        };
    }

    /**
     * Save to public directory
     */
    private async saveToPublic(
        html: string,
        input: WebsiteGenerationInput
    ): Promise<{ url: string; filePath: string }> {
        const timestamp = Date.now();
        const sanitizedName = input.businessName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .substring(0, 50);

        const filename = `${sanitizedName}-${timestamp}.html`;
        const filePath = `websites/${input.userId}/${filename}`;
        const fullPath = path.join(process.cwd(), 'public', filePath);

        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, html, 'utf-8');

        const publicUrl = `${process.env.PUBLIC_URL || 'http://localhost:3000'}/${filePath}`;

        return { url: publicUrl, filePath };
    }

    /**
     * Utility methods
     */
    private async saveJSON(filename: string, data: any): Promise<void> {
        const dir = path.join(this.outputDir, 'temp');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, filename), JSON.stringify(data, null, 2), 'utf-8');
    }

    private async saveFile(filename: string, content: string): Promise<void> {
        const dir = path.join(this.outputDir, 'temp');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, filename), content, 'utf-8');
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}