import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  ValidationPipe,
  UsePipes,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';


import { ModernWebsiteGeneratorService } from '../services/modern-websit-generator.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorator/auth.decorator';
import { WebsiteGenerationDto, WebsiteGenerationResponseDto, ValidationErrorResponseDto } from '../dto/modern-website-generator.dto';

@ApiTags('Modern Website Generation')
@Controller('generate')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ModernWebsiteGeneratorController {
  private readonly logger = new Logger(ModernWebsiteGeneratorController.name);

  constructor(private readonly generator: ModernWebsiteGeneratorService) {}

  /**
   * Generate a new website
   */
  @Post('website')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Generate a complete website',
    description:
      'Generates a production-ready, SEO-optimized, responsive website based on the provided configuration. ' +
      'The process takes approximately 60-90 seconds and returns a publicly accessible URL.',
  })
  @ApiBody({
    type: WebsiteGenerationDto,
    description: 'Website generation configuration',
    examples: {
      basic: {
        summary: 'Basic Website',
        description: 'Minimal configuration for a simple landing page',
        value: {
          businessName: 'TechNova Solutions',
          industry: 'Technology',
          tagline: 'Transform Your Business with AI',
          sections: ['Hero', 'Features', 'Pricing', 'Contact'],
          colorScheme: {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            accent: '#F59E0B',
            background: '#FFFFFF',
            text: '#1F2937',
          },
          userId: 'user_123',
        },
      },
      advanced: {
        summary: 'Advanced Website with Customization',
        description: 'Full configuration with custom navigation, footer, and SEO',
        value: {
          businessName: 'FitLife Pro',
          industry: 'Fitness & Wellness',
          tagline: 'Transform Your Body, Transform Your Life',
          vision: 'A world where everyone has access to personalized fitness',
          mission: 'Empowering individuals through technology',
          sections: ['Hero', 'Features', 'Services', 'Testimonials', 'Pricing', 'FAQ', 'Contact'],
          colorScheme: {
            primary: '#10B981',
            secondary: '#059669',
            accent: '#34D399',
            background: '#FFFFFF',
            backgroundAlt: '#F0FDF4',
            text: '#111827',
            textLight: '#6B7280',
          },
          logoUrl: 'https://example.com/logo.png',
          contactEmail: 'hello@fitlifepro.com',
          contactPhone: '+1 (555) 123-4567',
          userId: 'user_456',
          customization: {
            seo: {
              title: 'FitLife Pro - Personal Fitness Training',
              description: 'Transform your body with personalized fitness training',
              keywords: ['fitness', 'personal training', 'wellness'],
            },
            animations: {
              enabled: true,
              library: 'AOS',
              defaults: {
                duration: 1000,
                easing: 'ease-out-cubic',
                once: true,
                offset: 120,
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Website generated successfully',
    type: WebsiteGenerationResponseDto,
    schema: {
      example: {
        html: '<!DOCTYPE html><html>...</html>',
        url: 'https://launchix.com/websites/user_123/technova-1699123456.html',
        filePath: 'websites/user_123/technova-1699123456.html',
        stats: {
          duration: 76000,
          size: 245678,
          sections: 6,
          images: 15,
          tokensUsed: 47000,
        },
        metadata: {
          designJSON: {},
          warnings: [],
          errors: [],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed - Invalid input data',
    type: ValidationErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        errors: [
          {
            field: 'businessName',
            message: 'businessName must be longer than 2 characters',
            code: 'MIN_LENGTH',
          },
          {
            field: 'colorScheme.primary',
            message: 'colorScheme.primary must be a valid hex color',
            code: 'INVALID_HEX_COLOR',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit exceeded',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too many requests. Please try again later.',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error during generation',
    schema: {
      example: {
        statusCode: 500,
        message: 'Website generation failed',
        error: 'Unexpected error occurred',
      },
    },
  })
  async generateWebsite(
    @Body() dto: WebsiteGenerationDto,
    @CurrentUser() user: any,
  ): Promise<WebsiteGenerationResponseDto> {
    this.logger.log(`Starting website generation for user: ${user._id}, business: ${dto.businessName}`);

    try {
      // Security: Override userId with authenticated user's ID
      dto.userId = user._id;

      // Validate sections
      this.validateSections(dto.sections);

      // Generate the website
      const startTime = Date.now();
      const result = await this.generator.generateCompleteWebsite(dto as any);
      const duration = Date.now() - startTime;

      this.logger.log(
        `Website generated successfully for ${dto.businessName}. Duration: ${duration}ms, URL: ${result.url}`,
      );

      // Return response
      return {
        html: result.html,
        url: result.url,
        filePath: result.filePath,
        stats: {
          ...result.stats,
          duration,
        } as any,
        metadata: result.metadata,
      };
    } catch (error) {
      this.logger.error(`Website generation failed: ${error.message}`, error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Website generation failed',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get list of available sections
   */
  @Get('sections')
  @ApiOperation({
    summary: 'Get available website sections',
    description: 'Returns a list of all available sections that can be used in website generation',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of available sections',
    schema: {
      example: {
        sections: [
          {
            id: 'hero',
            name: 'Hero',
            description: 'Main landing section with headline and CTA',
            recommended: true,
          },
          {
            id: 'features',
            name: 'Features',
            description: 'Showcase product or service features in a grid layout',
            recommended: true,
          },
          {
            id: 'about',
            name: 'About',
            description: 'Company background, mission, and vision',
            recommended: false,
          },
          {
            id: 'services',
            name: 'Services',
            description: 'List of services offered',
            recommended: true,
          },
          {
            id: 'testimonials',
            name: 'Testimonials',
            description: 'Customer reviews and testimonials',
            recommended: true,
          },
          {
            id: 'pricing',
            name: 'Pricing',
            description: 'Pricing plans and comparison',
            recommended: true,
          },
          {
            id: 'team',
            name: 'Team',
            description: 'Team members with photos and bios',
            recommended: false,
          },
          {
            id: 'gallery',
            name: 'Gallery',
            description: 'Image gallery or portfolio showcase',
            recommended: false,
          },
          {
            id: 'faq',
            name: 'FAQ',
            description: 'Frequently asked questions with accordion',
            recommended: false,
          },
          {
            id: 'contact',
            name: 'Contact',
            description: 'Contact form and information',
            recommended: true,
          },
        ],
      },
    },
  })
  getAvailableSections() {
    return {
      sections: [
        {
          id: 'hero',
          name: 'Hero',
          description: 'Main landing section with headline, subheadline, CTA buttons, and hero image',
          recommended: true,
          requiredForSEO: true,
        },
        {
          id: 'features',
          name: 'Features',
          description: 'Showcase product or service features in a responsive grid layout with icons',
          recommended: true,
          requiredForSEO: false,
        },
        {
          id: 'about',
          name: 'About',
          description: 'Company background, mission statement, vision, and achievement statistics',
          recommended: false,
          requiredForSEO: false,
        },
        {
          id: 'services',
          name: 'Services',
          description: 'List of services offered with descriptions and CTAs',
          recommended: true,
          requiredForSEO: false,
        },
        {
          id: 'products',
          name: 'Products',
          description: 'Product showcase with images, descriptions, and pricing',
          recommended: false,
          requiredForSEO: false,
        },
        {
          id: 'testimonials',
          name: 'Testimonials',
          description: 'Customer reviews and testimonials with ratings and avatars',
          recommended: true,
          requiredForSEO: false,
        },
        {
          id: 'pricing',
          name: 'Pricing',
          description: 'Pricing plans comparison with features and CTAs',
          recommended: true,
          requiredForSEO: false,
        },
        {
          id: 'team',
          name: 'Team',
          description: 'Team members with photos, bios, and social links',
          recommended: false,
          requiredForSEO: false,
        },
        {
          id: 'gallery',
          name: 'Gallery',
          description: 'Image gallery or portfolio showcase with lightbox',
          recommended: false,
          requiredForSEO: false,
        },
        {
          id: 'showcase',
          name: 'Showcase',
          description: 'Portfolio or work showcase with filtering',
          recommended: false,
          requiredForSEO: false,
        },
        {
          id: 'faq',
          name: 'FAQ',
          description: 'Frequently asked questions with collapsible accordion',
          recommended: false,
          requiredForSEO: false,
        },
        {
          id: 'contact',
          name: 'Contact',
          description: 'Contact form with validation and contact information display',
          recommended: true,
          requiredForSEO: true,
        },
      ],
    };
  }

  /**
   * Get color scheme presets
   */
  @Get('color-schemes')
  @ApiOperation({
    summary: 'Get predefined color scheme presets',
    description: 'Returns a collection of professionally designed color schemes for different industries',
  })
  @ApiQuery({
    name: 'industry',
    required: false,
    description: 'Filter by industry',
    example: 'technology',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of color scheme presets',
  })
  getColorSchemes(@Query('industry') industry?: string) {
    const schemes = [
      {
        name: 'Modern Blue',
        category: 'Technology',
        description: 'Professional and trustworthy for tech and SaaS companies',
        scheme: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          accent: '#F59E0B',
          background: '#FFFFFF',
          text: '#1F2937',
        },
      },
      {
        name: 'Vibrant Green',
        category: 'Health & Wellness',
        description: 'Fresh and energetic for health, fitness, and eco businesses',
        scheme: {
          primary: '#10B981',
          secondary: '#059669',
          accent: '#34D399',
          background: '#FFFFFF',
          text: '#111827',
        },
      },
      {
        name: 'Bold Red',
        category: 'Food & Hospitality',
        description: 'Appetizing and energetic for restaurants and food services',
        scheme: {
          primary: '#EF4444',
          secondary: '#DC2626',
          accent: '#F97316',
          background: '#FFFFFF',
          text: '#1F2937',
        },
      },
      {
        name: 'Professional Purple',
        category: 'Creative & Design',
        description: 'Creative and sophisticated for agencies and designers',
        scheme: {
          primary: '#8B5CF6',
          secondary: '#7C3AED',
          accent: '#A78BFA',
          background: '#FFFFFF',
          text: '#1F2937',
        },
      },
      {
        name: 'Elegant Gold',
        category: 'Luxury & Premium',
        description: 'Luxurious and premium for high-end brands',
        scheme: {
          primary: '#F59E0B',
          secondary: '#D97706',
          accent: '#FBBF24',
          background: '#FFFFFF',
          text: '#111827',
        },
      },
      {
        name: 'Ocean Teal',
        category: 'Marine & Travel',
        description: 'Calm and refreshing for travel and marine businesses',
        scheme: {
          primary: '#14B8A6',
          secondary: '#0D9488',
          accent: '#2DD4BF',
          background: '#FFFFFF',
          text: '#1F2937',
        },
      },
      {
        name: 'Dark Mode',
        category: 'Technology',
        description: 'Modern dark theme for tech-savvy audiences',
        scheme: {
          primary: '#60A5FA',
          secondary: '#A78BFA',
          accent: '#FBBF24',
          background: '#1F2937',
          text: '#F9FAFB',
        },
      },
      {
        name: 'Soft Pink',
        category: 'Beauty & Fashion',
        description: 'Elegant and feminine for beauty and fashion brands',
        scheme: {
          primary: '#EC4899',
          secondary: '#DB2777',
          accent: '#F472B6',
          background: '#FFFFFF',
          text: '#1F2937',
        },
      },
    ];

    if (industry) {
      return {
        schemes: schemes.filter(s =>
          s.category.toLowerCase().includes(industry.toLowerCase()),
        ),
      };
    }

    return { schemes };
  }

  /**
   * Validate website generation input without generating
   */
  @Post('validate')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Validate website generation input',
    description: 'Validates the input configuration without actually generating the website',
  })
  @ApiBody({ type: WebsiteGenerationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validation successful',
    schema: {
      example: {
        valid: true,
        message: 'Configuration is valid',
        warnings: [],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
    type: ValidationErrorResponseDto,
  })
  async validateInput(
    @Body() dto: WebsiteGenerationDto,
    @CurrentUser() user: any,
  ) {
    dto.userId = user.id;

    const warnings: string[] = [];

    // Check sections
    if (dto.sections.length < 4) {
      warnings.push('Consider adding more sections for a complete website (minimum 4 recommended)');
    }

    if (!dto.sections.includes('Hero')) {
      warnings.push('Hero section is highly recommended for better user engagement');
    }

    if (!dto.sections.includes('Contact')) {
      warnings.push('Contact section is recommended for user communication');
    }

    // Check color contrast
    if (dto.colorScheme.primary === dto.colorScheme.secondary) {
      warnings.push('Primary and secondary colors are the same - consider using different shades');
    }

    // Check optional fields
    if (!dto.contactEmail && dto.sections.includes('Contact')) {
      warnings.push('Contact email not provided - default email will be used');
    }

    if (!dto.logoUrl) {
      warnings.push('Logo URL not provided - placeholder logo will be used');
    }

    return {
      valid: true,
      message: 'Configuration is valid and ready for generation',
      warnings,
      estimatedTime: '60-90 seconds',
      estimatedTokens: 45000 + dto.sections.length * 2000,
    };
  }

  /**
   * Get generation status (if using async generation)
   */
  @Get('status/:jobId')
  @ApiOperation({
    summary: 'Get generation job status',
    description: 'Check the status of an asynchronous website generation job',
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID returned from async generation',
    example: 'job_1699123456789',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job status retrieved',
    schema: {
      example: {
        jobId: 'job_1699123456789',
        status: 'completed',
        progress: 100,
        result: {
          url: 'https://launchix.com/websites/user_123/technova-1699123456.html',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found',
  })
  async getGenerationStatus(@Param('jobId') jobId: string, @CurrentUser() user: any) {
    // Implementation would integrate with a queue system like Bull
    throw new NotFoundException('Async generation not yet implemented');
  }

  /**
   * Get user's generated websites
   */
  @Get('my-websites')
  @ApiOperation({
    summary: 'Get all websites generated by the current user',
    description: 'Returns a paginated list of websites created by the authenticated user',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of user websites',
    schema: {
      example: {
        data: [
          {
            id: 'web_123',
            businessName: 'TechNova Solutions',
            url: 'https://launchix.com/websites/user_123/technova-1699123456.html',
            createdAt: '2024-11-05T10:30:00Z',
            stats: {
              size: 245678,
              sections: 6,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          pages: 3,
        },
      },
    },
  })
  async getMyWebsites(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    // Implementation would query database
    // This is a placeholder
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    };
  }

  /**
   * Delete a generated website
   */
  @Delete('website/:websiteId')
  @ApiOperation({
    summary: 'Delete a generated website',
    description: 'Permanently deletes a website and its associated files',
  })
  @ApiParam({
    name: 'websiteId',
    description: 'Website ID',
    example: 'web_123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Website deleted successfully',
    schema: {
      example: {
        message: 'Website deleted successfully',
        websiteId: 'web_123',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Website not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to delete this website',
  })
  async deleteWebsite(@Param('websiteId') websiteId: string, @CurrentUser() user: any) {
    // Implementation would:
    // 1. Check if website belongs to user
    // 2. Delete file from storage
    // 3. Delete database record
    throw new NotFoundException('Delete functionality not yet implemented');
  }

  /**
   * Private helper methods
   */
  private validateSections(sections: string[]): void {
    const validSections = [
      'hero',
      'features',
      'about',
      'services',
      'products',
      'testimonials',
      'pricing',
      'team',
      'gallery',
      'showcase',
      'portfolio',
      'faq',
      'contact',
    ];

    const invalidSections = sections.filter(
      section => !validSections.includes(section.toLowerCase().replace(/\s+/g, '-')),
    );

    if (invalidSections.length > 0) {
      throw new BadRequestException({
        message: 'Invalid sections provided',
        invalidSections,
        validSections,
      });
    }

    if (!sections.some(s => s.toLowerCase() === 'hero')) {
      this.logger.warn('Website generation without Hero section - not recommended');
    }
  }
}