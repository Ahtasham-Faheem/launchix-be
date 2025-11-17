import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  IsArray,
  IsOptional,
  ValidateNested,
  IsObject,
  MinLength,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
  IsHexColor,
  IsIn,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========================================
// COLOR SCHEME DTO
// ========================================

export class ColorSchemeDto {
  @ApiProperty({
    description: 'Primary brand color (hex format)',
    example: '#3B82F6',
  })
  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  primary: string;

  @ApiProperty({
    description: 'Secondary brand color (hex format)',
    example: '#8B5CF6',
  })
  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  secondary: string;

  @ApiProperty({
    description: 'Accent color (hex format)',
    example: '#F59E0B',
  })
  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  accent: string;

  @ApiProperty({
    description: 'Background color (hex format)',
    example: '#FFFFFF',
  })
  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  background: string;

  @ApiProperty({
    description: 'Text color (hex format)',
    example: '#1F2937',
  })
  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({
    description: 'Alternate background color (hex format)',
    example: '#F9FAFB',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  backgroundAlt?: string;

  @ApiPropertyOptional({
    description: 'Light text color (hex format)',
    example: '#6B7280',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  textLight?: string;

  @ApiPropertyOptional({
    description: 'Success color (hex format)',
    example: '#10B981',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  success?: string;

  @ApiPropertyOptional({
    description: 'Warning color (hex format)',
    example: '#F59E0B',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  warning?: string;

  @ApiPropertyOptional({
    description: 'Error color (hex format)',
    example: '#EF4444',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  error?: string;
}

// ========================================
// TYPOGRAPHY DTO
// ========================================

export class FontWeightsDto {
  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(900)
  light?: number;

  @ApiProperty({ example: 400 })
  @IsNumber()
  @Min(100)
  @Max(900)
  regular: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(100)
  @Max(900)
  medium: number;

  @ApiProperty({ example: 600 })
  @IsNumber()
  @Min(100)
  @Max(900)
  semibold: number;

  @ApiProperty({ example: 700 })
  @IsNumber()
  @Min(100)
  @Max(900)
  bold: number;

  @ApiProperty({ example: 800 })
  @IsNumber()
  @Min(100)
  @Max(900)
  extrabold: number;
}

export class TypographyDto {
  @ApiProperty({
    description: 'Google Font name for headings',
    example: 'Poppins',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  headingFont: string;

  @ApiProperty({
    description: 'Google Font name for body text',
    example: 'Inter',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  bodyFont: string;

  @ApiProperty({ description: 'Font weights configuration' })
  @ValidateNested()
  @Type(() => FontWeightsDto)
  fontWeights: FontWeightsDto;

  @ApiPropertyOptional({
    description: 'Google Font name for monospace text',
    example: 'Fira Code',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  monoFont?: string;
}

// ========================================
// NAVIGATION DTO
// ========================================

export class NavigationItemDto {
  @ApiProperty({
    description: 'Navigation item label',
    example: 'Home',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  label: string;

  @ApiProperty({
    description: 'Navigation item link (hash or URL)',
    example: '#hero',
  })
  @IsString()
  @IsNotEmpty()
  link: string;

  @ApiPropertyOptional({
    description: 'Icon class (Font Awesome)',
    example: 'fa-home',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Link target',
    example: '_self',
    enum: ['_self', '_blank'],
  })
  @IsOptional()
  @IsIn(['_self', '_blank'])
  target?: '_self' | '_blank';
}

export class CTAButtonDto {
  @ApiProperty({
    description: 'CTA button text',
    example: 'Get Started',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  text: string;

  @ApiProperty({
    description: 'CTA button link',
    example: '#contact',
  })
  @IsString()
  @IsNotEmpty()
  link: string;

  @ApiProperty({
    description: 'CTA button style',
    example: 'primary',
    enum: ['primary', 'secondary', 'outline', 'ghost'],
  })
  @IsIn(['primary', 'secondary', 'outline', 'ghost'])
  style: 'primary' | 'secondary' | 'outline' | 'ghost';

  @ApiPropertyOptional({
    description: 'Button icon',
    example: 'fa-arrow-right',
  })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class NavigationDto {
  @ApiProperty({
    description: 'Navigation position',
    example: 'fixed',
    enum: ['fixed', 'absolute', 'sticky', 'relative'],
  })
  @IsIn(['fixed', 'absolute', 'sticky', 'relative'])
  position: 'fixed' | 'absolute' | 'sticky' | 'relative';

  @ApiProperty({
    description: 'Whether navigation is transparent initially',
    example: true,
  })
  @IsBoolean()
  transparent: boolean;

  @ApiProperty({
    description: 'Whether to show CTA button in navigation',
    example: true,
  })
  @IsBoolean()
  showCTA: boolean;

  @ApiProperty({
    description: 'Navigation items',
    type: [NavigationItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  items: NavigationItemDto[];

  @ApiPropertyOptional({
    description: 'CTA button configuration',
    type: CTAButtonDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CTAButtonDto)
  cta?: CTAButtonDto;

  @ApiPropertyOptional({
    description: 'Mobile breakpoint in pixels',
    example: 768,
  })
  @IsOptional()
  @IsNumber()
  @Min(320)
  @Max(1024)
  mobileBreakpoint?: number;

  @ApiPropertyOptional({
    description: 'Scroll threshold for style change',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  scrollThreshold?: number;
}

// ========================================
// FOOTER DTO
// ========================================

export class FooterLinkDto {
  @ApiProperty({
    description: 'Link label',
    example: 'About Us',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  label: string;

  @ApiProperty({
    description: 'Link URL or hash',
    example: '#about',
  })
  @IsString()
  @IsNotEmpty()
  link: string;

  @ApiPropertyOptional({
    description: 'Link icon',
    example: 'fa-info-circle',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Link target',
    example: '_self',
    enum: ['_self', '_blank'],
  })
  @IsOptional()
  @IsIn(['_self', '_blank'])
  target?: '_self' | '_blank';
}

export class FooterColumnDto {
  @ApiProperty({
    description: 'Column title',
    example: 'Company',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  title: string;

  @ApiProperty({
    description: 'Column links',
    type: [FooterLinkDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterLinkDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  links: FooterLinkDto[];
}

export class NewsletterDto {
  @ApiProperty({
    description: 'Whether newsletter is enabled',
    example: true,
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'Newsletter title',
    example: 'Subscribe to our newsletter',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'Newsletter description',
    example: 'Get the latest updates',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({
    description: 'Input placeholder text',
    example: 'Enter your email',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  placeholder?: string;

  @ApiProperty({
    description: 'Submit button text',
    example: 'Subscribe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  buttonText: string;

  @ApiPropertyOptional({
    description: 'Success message',
    example: 'Thank you for subscribing!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  successMessage?: string;

  @ApiPropertyOptional({
    description: 'Error message',
    example: 'Something went wrong',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  errorMessage?: string;
}

export class SocialLinksDto {
  @ApiPropertyOptional({ example: 'https://facebook.com/company' })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/company' })
  @IsOptional()
  @IsUrl()
  twitter?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/company' })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/company/company' })
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/company' })
  @IsOptional()
  @IsUrl()
  youtube?: string;

  @ApiPropertyOptional({ example: 'https://github.com/company' })
  @IsOptional()
  @IsUrl()
  github?: string;

  @ApiPropertyOptional({ example: 'https://tiktok.com/@company' })
  @IsOptional()
  @IsUrl()
  tiktok?: string;
}

export class FooterBottomDto {
  @ApiProperty({
    description: 'Whether to show bottom bar',
    example: true,
  })
  @IsBoolean()
  show: boolean;

  @ApiProperty({
    description: 'Copyright text',
    example: '© 2025 Company. All rights reserved.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  copyright: string;

  @ApiPropertyOptional({
    description: 'Bottom bar layout',
    example: 'split',
    enum: ['left', 'center', 'split'],
  })
  @IsOptional()
  @IsIn(['left', 'center', 'split'])
  layout?: 'left' | 'center' | 'split';

  @ApiPropertyOptional({
    description: 'Bottom bar links',
    type: [FooterLinkDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterLinkDto)
  links?: FooterLinkDto[];
}

export class FooterDto {
  @ApiProperty({
    description: 'Footer layout',
    example: '4-column',
    enum: ['2-column', '3-column', '4-column', '5-column', 'centered'],
  })
  @IsIn(['2-column', '3-column', '4-column', '5-column', 'centered'])
  layout: '2-column' | '3-column' | '4-column' | '5-column' | 'centered';

  @ApiProperty({
    description: 'Whether to show newsletter signup',
    example: true,
  })
  @IsBoolean()
  showNewsletter: boolean;

  @ApiProperty({
    description: 'Whether to show social links',
    example: true,
  })
  @IsBoolean()
  showSocial: boolean;

  @ApiProperty({
    description: 'Footer columns',
    type: [FooterColumnDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterColumnDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  columns: FooterColumnDto[];

  @ApiPropertyOptional({
    description: 'Newsletter configuration',
    type: NewsletterDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NewsletterDto)
  newsletter?: NewsletterDto;

  @ApiPropertyOptional({
    description: 'Social media links',
    type: SocialLinksDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  social?: SocialLinksDto;

  @ApiPropertyOptional({
    description: 'Footer bottom bar',
    type: FooterBottomDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FooterBottomDto)
  bottom?: FooterBottomDto;
}

// ========================================
// SEO DTO
// ========================================

export class StructuredDataDto {
  @ApiProperty({
    description: 'Schema.org context',
    example: 'https://schema.org',
  })
  @IsString()
  @IsNotEmpty()
  '@context': string;

  @ApiProperty({
    description: 'Schema.org type',
    example: 'Organization',
  })
  @IsString()
  @IsNotEmpty()
  '@type': string;

  // Allow any additional properties
  [key: string]: any;
}

export class MetaTagDto {
  @ApiPropertyOptional({ example: 'description' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'og:title' })
  @IsOptional()
  @IsString()
  property?: string;

  @ApiProperty({ example: 'Page description' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'Content-Type' })
  @IsOptional()
  @IsString()
  httpEquiv?: string;
}

export class SEODto {
  @ApiProperty({
    description: 'Page title (50-60 characters recommended)',
    example: 'Company Name - Tagline',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(70)
  title: string;

  @ApiProperty({
    description: 'Meta description (150-160 characters recommended)',
    example: 'Leading solutions for modern businesses',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(160)
  description: string;

  @ApiProperty({
    description: 'SEO keywords',
    example: ['technology', 'saas', 'automation'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(3)
  @ArrayMaxSize(10)
  keywords: string[];

  @ApiPropertyOptional({
    description: 'Content author',
    example: 'Company Name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;

  @ApiPropertyOptional({
    description: 'Content language',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z]{2}(-[A-Z]{2})?$/)
  language?: string;

  @ApiPropertyOptional({
    description: 'Robots meta tag',
    example: 'index, follow',
  })
  @IsOptional()
  @IsString()
  robots?: string;

  @ApiPropertyOptional({
    description: 'Canonical URL',
    example: 'https://example.com',
  })
  @IsOptional()
  @IsUrl()
  canonical?: string;

  @ApiPropertyOptional({
    description: 'Open Graph image URL',
    example: 'https://example.com/og-image.jpg',
  })
  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @ApiPropertyOptional({
    description: 'Open Graph type',
    example: 'website',
  })
  @IsOptional()
  @IsString()
  ogType?: string;

  @ApiPropertyOptional({
    description: 'Twitter card type',
    example: 'summary_large_image',
    enum: ['summary', 'summary_large_image', 'app', 'player'],
  })
  @IsOptional()
  @IsIn(['summary', 'summary_large_image', 'app', 'player'])
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';

  @ApiPropertyOptional({
    description: 'Twitter site handle',
    example: '@company',
  })
  @IsOptional()
  @IsString()
  @Matches(/^@[A-Za-z0-9_]{1,15}$/)
  twitterSite?: string;

  @ApiPropertyOptional({
    description: 'Structured data (JSON-LD)',
    type: [StructuredDataDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StructuredDataDto)
  structuredData?: StructuredDataDto[];

  @ApiPropertyOptional({
    description: 'Additional meta tags',
    type: [MetaTagDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaTagDto)
  additionalMetaTags?: MetaTagDto[];
}

// ========================================
// ANIMATIONS DTO
// ========================================

export class AnimationDefaultsDto {
  @ApiProperty({
    description: 'Animation duration in milliseconds',
    example: 1000,
  })
  @IsNumber()
  @Min(100)
  @Max(5000)
  duration: number;

  @ApiProperty({
    description: 'Animation easing function',
    example: 'ease-out-cubic',
  })
  @IsString()
  @IsNotEmpty()
  easing: string;

  @ApiProperty({
    description: 'Whether animation triggers only once',
    example: true,
  })
  @IsBoolean()
  once: boolean;

  @ApiProperty({
    description: 'Offset in pixels from trigger point',
    example: 120,
  })
  @IsNumber()
  @Min(0)
  @Max(500)
  offset: number;

  @ApiPropertyOptional({
    description: 'Animation delay in milliseconds',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2000)
  delay?: number;

  @ApiPropertyOptional({
    description: 'Whether to mirror animation on scroll up',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  mirror?: boolean;
}

export class AnimationDto {
  @ApiProperty({
    description: 'Whether animations are enabled',
    example: true,
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'Animation library to use',
    example: 'AOS',
    enum: ['AOS', 'GSAP', 'Framer Motion', 'custom', 'none'],
  })
  @IsIn(['AOS', 'GSAP', 'Framer Motion', 'custom', 'none'])
  library: 'AOS' | 'GSAP' | 'Framer Motion' | 'custom' | 'none';

  @ApiProperty({
    description: 'Default animation settings',
    type: AnimationDefaultsDto,
  })
  @ValidateNested()
  @Type(() => AnimationDefaultsDto)
  defaults: AnimationDefaultsDto;
}

// ========================================
// CUSTOMIZATION DTO
// ========================================

export class CustomizationDto {
  @ApiPropertyOptional({
    description: 'Custom typography settings',
    type: TypographyDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TypographyDto)
  typography?: TypographyDto;

  @ApiPropertyOptional({
    description: 'Custom navigation settings',
    type: NavigationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NavigationDto)
  navigation?: NavigationDto;

  @ApiPropertyOptional({
    description: 'Custom footer settings',
    type: FooterDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FooterDto)
  footer?: FooterDto;

  @ApiPropertyOptional({
    description: 'Custom SEO settings',
    type: SEODto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SEODto)
  seo?: SEODto;

  @ApiPropertyOptional({
    description: 'Custom animation settings',
    type: AnimationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AnimationDto)
  animations?: AnimationDto;
}

// ========================================
// MAIN WEBSITE GENERATION DTO
// ========================================

export class WebsiteGenerationDto {
  @ApiProperty({
    description: 'Business/Company name',
    example: 'TechNova Solutions',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  businessName: string;

  @ApiProperty({
    description: 'Industry or business category',
    example: 'Technology',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  industry: string;

  @ApiProperty({
    description: 'Company tagline or slogan',
    example: 'Transform Your Business with AI',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  tagline: string;

  @ApiPropertyOptional({
    description: 'Company vision statement',
    example: 'To revolutionize how businesses operate',
  })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(500)
  vision?: string;

  @ApiPropertyOptional({
    description: 'Company mission statement',
    example: 'Empowering businesses through innovative technology',
  })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(500)
  mission?: string;

  @ApiProperty({
    description: 'Website sections to include',
    example: ['Hero', 'Features', 'Testimonials', 'Pricing', 'Contact'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(3)
  @ArrayMaxSize(12)
  sections: string[];

  @ApiProperty({
    description: 'Color scheme configuration',
    type: ColorSchemeDto,
  })
  @ValidateNested()
  @Type(() => ColorSchemeDto)
  colorScheme: ColorSchemeDto;

  @ApiPropertyOptional({
    description: 'Logo URL',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Contact email address',
    example: 'hello@technova.com',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1 (555) 123-4567',
  })
  @IsOptional()
//   @IsPhoneNumber()
  contactPhone?: string;

  @ApiProperty({
    description: 'User ID (will be set automatically from auth)',
    example: 'user_123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'Custom configuration overrides',
    type: CustomizationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomizationDto)
  customization?: CustomizationDto;
}

// ========================================
// RESPONSE DTO
// ========================================

export class GenerationStatsDto {
  @ApiProperty({ description: 'Generation duration in milliseconds', example: 76000 })
  duration: number;

  @ApiProperty({ description: 'File size in bytes', example: 245678 })
  size: number;

  @ApiProperty({ description: 'Number of sections', example: 6 })
  sections: number;

  @ApiPropertyOptional({ description: 'Number of images', example: 15 })
  images?: number;

  @ApiPropertyOptional({ description: 'Total tokens used', example: 47000 })
  tokensUsed?: number;
}

export class WebsiteGenerationResponseDto {
  @ApiProperty({
    description: 'Generated website HTML',
    example: '<!DOCTYPE html>...',
  })
  html: string;

  @ApiProperty({
    description: 'Public URL of the generated website',
    example: 'https://launchix.com/websites/user_123/technova-1699123456.html',
  })
  url: string;

  @ApiProperty({
    description: 'File path relative to public directory',
    example: 'websites/user_123/technova-1699123456.html',
  })
  filePath: string;

  @ApiProperty({
    description: 'Generation statistics',
    type: GenerationStatsDto,
  })
  stats: GenerationStatsDto;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  metadata?: any;
}

// ========================================
// VALIDATION ERROR RESPONSE DTO
// ========================================

export class ValidationErrorDto {
  @ApiProperty({ example: 'businessName' })
  field: string;

  @ApiProperty({ example: 'businessName must be longer than 2 characters' })
  message: string;

  @ApiProperty({ example: 'MIN_LENGTH' })
  code: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ type: [ValidationErrorDto] })
  errors: ValidationErrorDto[];
}