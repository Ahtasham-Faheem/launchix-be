/**
 * Integration with Launchix System
 * This shows how to integrate the website generator with your existing Launchix workflow
 */

import { Injectable, Logger } from '@nestjs/common';
import { WebsiteGeneratorService } from './website-generator.service';
import { WebsiteGenerationInput } from '../prompts/generate-complet-website-prompt';

@Injectable()
export class LaunchixIntegrationService {
  private readonly logger = new Logger(LaunchixIntegrationService.name);

  constructor(
    private readonly websiteGenerator: WebsiteGeneratorService,
    // Your existing services
    // private readonly brandingService: BrandingService,
    // private readonly logoService: LogoService,
  ) {}

  /**
   * Generate complete website from Launchix branding data
   * This integrates with your existing brand generation flow
   */
  async generateWebsiteFromBranding(brandingData: any, userId: string) {
    this.logger.log(`🎨 Generating website from branding data for user: ${userId}`);

    try {
      // Extract data from your existing branding system
      const websiteInput: WebsiteGenerationInput = {
        businessName: brandingData.businessName,
        industry: brandingData.industry,
        tagline: brandingData.tagline,
        vision: brandingData.vision,
        mission: brandingData.mission,
        logoUrl: brandingData.logoUrl, // From your logo generation
        colorScheme: {
          primary: brandingData.colors.primary,
          secondary: brandingData.colors.secondary,
          accent: brandingData.colors.accent,
          background: brandingData.colors.background || '#FFFFFF',
          text: brandingData.colors.text || '#111827',
        },
        sections: this.determineSections(brandingData.industry),
        features: [
          'smooth scrolling',
          'mobile responsive',
          'contact form',
          'scroll animations',
        ],
        contactEmail: brandingData.contactEmail,
        contactPhone: brandingData.contactPhone,
        socialLinks: brandingData.socialLinks || {},
      };

      // Generate the website
      const website = await this.websiteGenerator.generateAndSaveWebsite(
        websiteInput as any,
        userId
      );

      this.logger.log(`✅ Website generated successfully: ${website.url}`);

      return {
        success: true,
        website,
        previewUrl: website.url,
        downloadUrl: website.url, // Users can download the HTML
      };
    } catch (error) {
      this.logger.error('Failed to generate website:', error);
      throw error;
    }
  }

  /**
   * Determine sections based on industry
   */
  private determineSections(industry: string): string[] {
    const sectionMap: Record<string, string[]> = {
      'software': ['hero', 'features', 'services', 'pricing', 'testimonials', 'faq', 'contact'],
      'saas': ['hero', 'features', 'pricing', 'testimonials', 'faq', 'contact'],
      'agency': ['hero', 'about', 'services', 'portfolio', 'team', 'testimonials', 'contact'],
      'restaurant': ['hero', 'about', 'services', 'portfolio', 'testimonials', 'contact'],
      'fitness': ['hero', 'about', 'services', 'team', 'testimonials', 'pricing', 'contact'],
      'ecommerce': ['hero', 'features', 'portfolio', 'testimonials', 'faq', 'contact'],
      'healthcare': ['hero', 'about', 'services', 'team', 'testimonials', 'contact'],
      'real-estate': ['hero', 'portfolio', 'services', 'about', 'team', 'contact'],
      'education': ['hero', 'about', 'services', 'team', 'testimonials', 'faq', 'contact'],
      'default': ['hero', 'about', 'services', 'testimonials', 'contact'],
    };

    const normalizedIndustry = industry.toLowerCase().replace(/\s+/g, '-');
    return sectionMap[normalizedIndustry] || sectionMap['default'];
  }

  /**
   * Example: Complete Launchix Flow
   * 1. Generate logo
   * 2. Generate color scheme
   * 3. Generate website with everything
   */
  async completeGenerationFlow(input: {
    businessName: string;
    industry: string;
    tagline: string;
    vision: string;
    mission: string;
    contactEmail?: string;
    contactPhone?: string;
    userId: string;
  }) {
    this.logger.log(`🚀 Starting complete generation flow for: ${input.businessName}`);

    try {
      // Step 1: Generate Logo (your existing logo generation)
      // const logoResult = await this.logoService.generateLogo({
      //   businessName: input.businessName,
      //   industry: input.industry,
      // });

      // Placeholder - replace with your logo generation
      const logoUrl = `https://picsum.photos/200/80?random=${Date.now()}`;

      // Step 2: Generate Color Scheme (your existing color generation)
      // const colors = await this.brandingService.generateColorScheme({
      //   industry: input.industry,
      // });

      // Placeholder - replace with your color generation
      const colorScheme = {
        primary: '#4F46E5',
        secondary: '#22D3EE',
        accent: '#0EA5E9',
        background: '#FFFFFF',
        text: '#111827',
      };

      // Step 3: Generate Complete Website
      const websiteInput: WebsiteGenerationInput = {
        businessName: input.businessName,
        industry: input.industry,
        tagline: input.tagline,
        vision: input.vision,
        mission: input.mission,
        logoUrl,
        colorScheme,
        sections: this.determineSections(input.industry),
        features: ['smooth scrolling', 'mobile responsive', 'contact form'],
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
      };

      const website = await this.websiteGenerator.generateAndSaveWebsite(
        websiteInput as any,
        input.userId
      );

      // Step 4: Save everything to your database
      // await this.saveToLaunchixDatabase({
      //   userId: input.userId,
      //   logo: logoUrl,
      //   colors: colorScheme,
      //   website: website.url,
      //   ...
      // });

      return {
        success: true,
        logo: logoUrl,
        colors: colorScheme,
        website: {
          url: website.url,
          filePath: website.filePath,
          sections: this.websiteGenerator.extractSections(website.html),
        },
        message: 'Complete branding and website generated successfully!',
      };
    } catch (error) {
      this.logger.error('Complete generation flow failed:', error);
      throw error;
    }
  }

  /**
   * Update existing website with new branding
   */
  async updateWebsiteWithNewBranding(
    websiteId: string,
    newBrandingData: any,
    userId: string
  ) {
    this.logger.log(`🔄 Updating website with new branding: ${websiteId}`);

    // Get existing website HTML
    // const existingWebsite = await this.getWebsiteById(websiteId);

    // Create new input with updated branding
    const updatedInput: WebsiteGenerationInput = {
      businessName: newBrandingData.businessName,
      industry: newBrandingData.industry,
      tagline: newBrandingData.tagline,
      vision: newBrandingData.vision,
      mission: newBrandingData.mission,
      logoUrl: newBrandingData.logoUrl,
      colorScheme: newBrandingData.colors,
      sections: this.determineSections(newBrandingData.industry),
    };

    // Regenerate website with new branding
    const updatedWebsite = await this.websiteGenerator.generateAndSaveWebsite(
      updatedInput as any,
      userId
    );

    return updatedWebsite;
  }

  /**
   * Example: Generate multiple website variations
   * Useful for A/B testing or giving users options
   */
  async generateMultipleVariations(
    brandingData: any,
    userId: string,
    count: number = 3
  ) {
    this.logger.log(`🎭 Generating ${count} website variations`);

    const variations = [];

    for (let i = 0; i < count; i++) {
      // Slightly modify sections or features for each variation
      const sections = this.getVariationSections(brandingData.industry, i);

      const websiteInput: WebsiteGenerationInput = {
        businessName: brandingData.businessName,
        industry: brandingData.industry,
        tagline: brandingData.tagline,
        vision: brandingData.vision,
        mission: brandingData.mission,
        logoUrl: brandingData.logoUrl,
        colorScheme: brandingData.colors,
        sections,
        features: this.getVariationFeatures(i),
      };

      const website = await this.websiteGenerator.generateAndSaveWebsite(
        websiteInput as any,
        userId
      );

      variations.push({
        variationNumber: i + 1,
        sections,
        url: website.url,
        previewUrl: website.url,
      });

      // Add small delay to avoid rate limits
      await this.delay(1000);
    }

    return {
      success: true,
      variations,
      message: `Generated ${count} website variations successfully!`,
    };
  }

  private getVariationSections(industry: string, variationIndex: number): string[] {
    const baseSections = this.determineSections(industry);

    // Variation 0: Standard sections
    if (variationIndex === 0) return baseSections;

    // Variation 1: Add portfolio
    if (variationIndex === 1) {
      return [...baseSections.slice(0, -1), 'portfolio', 'contact'];
    }

    // Variation 2: Add pricing and FAQ
    if (variationIndex === 2) {
      return [...baseSections.slice(0, -1), 'pricing', 'faq', 'contact'];
    }

    return baseSections;
  }

  private getVariationFeatures(variationIndex: number): string[] {
    const baseFeatures = ['smooth scrolling', 'mobile responsive', 'contact form'];

    const additionalFeatures = [
      ['scroll animations', 'image gallery'],
      ['accordion FAQ', 'counter animations'],
      ['pricing cards', 'testimonial slider'],
    ];

    return [...baseFeatures, ...additionalFeatures[variationIndex]];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Example Controller Endpoint
 */
import { Controller, Post, Body, Request } from '@nestjs/common';

@Controller('api/launchix')
export class LaunchixController {
  constructor(
    private readonly launchixIntegration: LaunchixIntegrationService,
  ) {}

  @Post('generate-complete')
  async generateComplete(
    @Body() dto: {
      businessName: string;
      industry: string;
      tagline: string;
      vision: string;
      mission: string;
      contactEmail?: string;
      contactPhone?: string;
    },
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'anonymous';

    return this.launchixIntegration.completeGenerationFlow({
      ...dto,
      userId,
    });
  }

  @Post('generate-variations')
  async generateVariations(
    @Body() dto: {
      businessName: string;
      industry: string;
      tagline: string;
      vision: string;
      mission: string;
      logoUrl: string;
      colors: any;
      count?: number;
    },
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'anonymous';

    return this.launchixIntegration.generateMultipleVariations(
      dto,
      userId,
      dto.count || 3
    );
  }
}

/**
 * Example Frontend Integration (React)
 */

/*
import React, { useState } from 'react';
import axios from 'axios';

function LaunchixWebsiteGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/launchix/generate-complete', {
        businessName: 'AccellionX',
        industry: 'Software Development',
        tagline: 'Building Digital Excellence',
        vision: 'To be the leading software development agency',
        mission: 'Delivering high-quality software solutions',
        contactEmail: 'contact@accellionx.com',
        contactPhone: '+92 300 1234567',
      });

      setResult(response.data);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Generate Your Complete Brand & Website</h1>
      
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Complete Branding'}
      </button>

      {result && (
        <div className="results">
          <h2>✅ Generation Complete!</h2>
          
          <div className="result-card">
            <h3>Logo</h3>
            <img src={result.logo} alt="Generated Logo" />
          </div>

          <div className="result-card">
            <h3>Color Scheme</h3>
            <div className="color-palette">
              <div style={{ background: result.colors.primary }}>Primary</div>
              <div style={{ background: result.colors.secondary }}>Secondary</div>
              <div style={{ background: result.colors.accent }}>Accent</div>
            </div>
          </div>

          <div className="result-card">
            <h3>Website</h3>
            <a href={result.website.url} target="_blank" rel="noopener noreferrer">
              View Your Website →
            </a>
            <p>Sections: {result.website.sections.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LaunchixWebsiteGenerator;
*/