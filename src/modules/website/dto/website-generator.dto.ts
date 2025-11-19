import { IsString, IsArray, IsOptional, IsObject, IsEmail, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ColorSchemeDto {
  @ApiProperty({ example: '#4F46E5', description: 'Primary brand color' })
  @IsString()
  primary: string;

  @ApiProperty({ example: '#22D3EE', description: 'Secondary brand color' })
  @IsString()
  secondary: string;

  @ApiProperty({ example: '#0EA5E9', description: 'Accent color' })
  @IsString()
  accent: string;

  @ApiProperty({ example: '#FFFFFF', description: 'Background color' })
  @IsString()
  background: string;

  @ApiProperty({ example: '#111827', description: 'Text color' })
  @IsString()
  text: string;
}

export class SocialLinksDto {
  @ApiPropertyOptional({ example: 'https://facebook.com/brandname' })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/brandname' })
  @IsOptional()
  @IsUrl()
  twitter?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/brandname' })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/company/brandname' })
  @IsOptional()
  @IsUrl()
  linkedin?: string;
}

export class GenerateWebsiteDto {
  @ApiProperty({ example: 'AccellionX', description: 'Business name' })
  @IsString()
  businessName: string;

  @ApiProperty({ example: 'Software Development', description: 'Business industry' })
  @IsString()
  industry: string;

  @ApiProperty({ example: 'Building Digital Excellence', description: 'Company tagline' })
  @IsString()
  tagline: string;

  @ApiProperty({ 
    example: 'To be the leading software development agency in Pakistan', 
    description: 'Company vision' 
  })
  @IsString()
  vision: string;

  @ApiProperty({ 
    example: 'Delivering high-quality software solutions that transform businesses', 
    description: 'Company mission' 
  })
  @IsString()
  mission: string;

  @ApiProperty({ 
    example: 'https://picsum.photos/200/80?random=999', 
    description: 'Logo URL' 
  })
  @IsUrl()
  logoUrl: string;

  @ApiProperty({ 
    type: ColorSchemeDto,
    description: 'Brand color scheme' 
  })
  @IsObject()
  colorScheme: ColorSchemeDto;

  @ApiProperty({ 
    example: ['hero', 'about', 'services', 'team', 'testimonials', 'contact'],
    description: 'Website sections to include',
    isArray: true,
    type: String
  })
  @IsArray()
  @IsString({ each: true })
  sections: string[];

  @ApiPropertyOptional({ 
    example: ['smooth scrolling', 'mobile responsive', 'contact form', 'animations'],
    description: 'Additional features to include',
    isArray: true,
    type: String
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ 
    example: 'contact@accellionx.com',
    description: 'Contact email' 
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ 
    example: '+92 300 1234567',
    description: 'Contact phone' 
  })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ 
    type: SocialLinksDto,
    description: 'Social media links' 
  })
  @IsOptional()
  @IsObject()
  socialLinks?: SocialLinksDto;
}

export class RegenerateSectionDto {
  @ApiProperty({ example: 'services', description: 'Section ID to regenerate' })
  @IsString()
  sectionId: string;

  @ApiProperty({ description: 'Original HTML content' })
  @IsString()
  originalHtml: string;

  @ApiProperty({ type: GenerateWebsiteDto, description: 'Website generation input' })
  @IsObject()
  websiteInput: GenerateWebsiteDto;
}

export class WebsiteResponseDto {
  @ApiProperty({ description: 'Generated HTML content' })
  html: string;

  @ApiProperty({ description: 'File path where HTML is saved' })
  filePath: string;

  @ApiProperty({ description: 'Public URL to access the website' })
  url: string;

  @ApiProperty({ description: 'List of sections in the website', isArray: true, type: String })
  sections: string[];

  @ApiProperty({ description: 'Character count of generated HTML' })
  size: number;
}