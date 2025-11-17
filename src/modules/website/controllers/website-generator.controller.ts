import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Logger,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WebsiteGeneratorService } from '../services/website-generator.service';
import {
  GenerateWebsiteDto,
  RegenerateSectionDto,
  WebsiteResponseDto
} from '../dto/website-generator.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorator/auth.decorator';

@ApiTags('Website Generator')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/website-generator')
export class WebsiteGeneratorController {
  private readonly logger = new Logger(WebsiteGeneratorController.name);

  constructor(
    private readonly websiteGeneratorService: WebsiteGeneratorService,
  ) { }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a complete multi-section website' })
  @ApiResponse({
    status: 201,
    description: 'Website generated successfully',
    type: WebsiteResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Website generation failed' })
  // @ApiBearerAuth() // Uncomment if using auth
  async generateWebsite(
    @CurrentUser() user: any,
    @Body() dto: GenerateWebsiteDto,

  ): Promise<WebsiteResponseDto> {
    try {
      // Get userId from authenticated request or use a default
      const userId = user._id || 'anonymous';

      this.logger.log(`📝 Website generation request for: ${dto.businessName}`);

      // Validate sections
      const validSections = [
        'hero', 'about', 'services', 'features', 'team',
        'portfolio', 'projects', 'testimonials', 'pricing',
        'faq', 'blog', 'contact',
        'show', 'products', 'shop', 'categories', 'offers', 'cart', 'checkout'
      ];

      const invalidSections = dto.sections.filter(s => !validSections.includes(s));
      if (invalidSections.length > 0) {
        throw new HttpException(
          `Invalid sections: ${invalidSections.join(', ')}. Valid sections are: ${validSections.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Generate website
      const result = await this.websiteGeneratorService.generateAndSaveWebsite(
        dto as any,
        userId
      );

      // Extract sections from HTML
      const sections = this.websiteGeneratorService.extractSections(result.html);

      return {
        html: result.html,
        filePath: result.filePath,
        url: result.url,
        sections,
        size: result.html.length,
      };
    } catch (error) {
      this.logger.error('Website generation error:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to generate website. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('generate-preview')
  @ApiOperation({ summary: 'Generate website HTML without saving (preview only)' })
  @ApiResponse({
    status: 201,
    description: 'Website preview generated successfully'
  })
  async generatePreview(
    @Body() dto: GenerateWebsiteDto,
  ): Promise<{ html: string; sections: string[]; size: number }> {
    try {
      this.logger.log(`👁️ Website preview request for: ${dto.businessName}`);

      const html = await this.websiteGeneratorService.generateCompleteWebsite(dto as any);
      const sections = this.websiteGeneratorService.extractSections(html);

      return {
        html,
        sections,
        size: html.length,
      };
    } catch (error) {
      this.logger.error('Preview generation error:', error);
      throw new HttpException(
        'Failed to generate preview. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('regenerate-section')
  @ApiOperation({ summary: 'Regenerate a specific section of an existing website' })
  @ApiResponse({
    status: 201,
    description: 'Section regenerated successfully'
  })
  async regenerateSection(
    @Body() dto: RegenerateSectionDto,
  ): Promise<{ html: string; message: string }> {
    try {
      this.logger.log(`🔄 Section regeneration request for: ${dto.sectionId}`);

      const updatedHtml = await this.websiteGeneratorService.regenerateSection(
        dto.originalHtml,
        dto.sectionId,
        dto.websiteInput as any
      );

      return {
        html: updatedHtml,
        message: `Section "${dto.sectionId}" regenerated successfully`,
      };
    } catch (error) {
      this.logger.error('Section regeneration error:', error);
      throw new HttpException(
        'Failed to regenerate section. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('sections')
  @ApiOperation({ summary: 'Get list of available sections' })
  @ApiResponse({
    status: 200,
    description: 'List of available sections'
  })
  getAvailableSections(): { sections: string[]; description: Record<string, string> } {
    return {
      sections: [
        'hero',
        'about',
        'services',
        'features',
        'team',
        'portfolio',
        'projects',
        'testimonials',
        'pricing',
        'faq',
        'blog',
        'contact',
      ],
      description: {
        hero: 'Eye-catching hero section with headline and CTA',
        about: 'Company story, mission, and values',
        services: 'Services or offerings with icons and descriptions',
        features: 'Product/service features with highlights',
        team: 'Team member profiles with photos and bios',
        portfolio: 'Portfolio or case study showcase',
        projects: 'Project gallery with images and descriptions',
        testimonials: 'Client testimonials and reviews',
        pricing: 'Pricing tiers and plans',
        faq: 'Frequently asked questions with accordion',
        blog: 'Blog posts or articles preview',
        contact: 'Contact form and information',
      },
    };
  }

  @Get('industries')
  @ApiOperation({ summary: 'Get list of supported industries with recommendations' })
  @ApiResponse({
    status: 200,
    description: 'List of industries and recommended sections'
  })
  getSupportedIndustries(): Record<string, any> {
    return {
      'Software/SaaS': {
        recommendedSections: ['hero', 'features', 'pricing', 'testimonials', 'faq', 'contact'],
        tone: 'Modern, innovative, data-driven',
      },
      'Healthcare': {
        recommendedSections: ['hero', 'about', 'services', 'team', 'testimonials', 'contact'],
        tone: 'Professional, trustworthy, caring',
      },
      'Finance': {
        recommendedSections: ['hero', 'services', 'about', 'team', 'testimonials', 'contact'],
        tone: 'Secure, reliable, professional',
      },
      'Fitness': {
        recommendedSections: ['hero', 'about', 'services', 'team', 'testimonials', 'pricing', 'contact'],
        tone: 'Energetic, motivational, empowering',
      },
      'Restaurant/Food': {
        recommendedSections: ['hero', 'about', 'services', 'portfolio', 'testimonials', 'contact'],
        tone: 'Appetizing, warm, inviting',
      },
      'Real Estate': {
        recommendedSections: ['hero', 'portfolio', 'services', 'about', 'team', 'contact'],
        tone: 'Premium, aspirational, trustworthy',
      },
      'Creative/Agency': {
        recommendedSections: ['hero', 'portfolio', 'services', 'team', 'testimonials', 'contact'],
        tone: 'Bold, innovative, expressive',
      },
      'Legal': {
        recommendedSections: ['hero', 'services', 'about', 'team', 'testimonials', 'contact'],
        tone: 'Professional, authoritative, trustworthy',
      },
      'Education': {
        recommendedSections: ['hero', 'about', 'services', 'team', 'testimonials', 'faq', 'contact'],
        tone: 'Informative, supportive, growth-focused',
      },
      'E-commerce': {
        recommendedSections: ['hero', 'features', 'portfolio', 'testimonials', 'faq', 'contact'],
        tone: 'Engaging, trustworthy, conversion-focused',
      },
    };
  }
}