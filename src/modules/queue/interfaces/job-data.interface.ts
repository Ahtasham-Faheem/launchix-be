import { Types } from 'mongoose';
import { Brand } from 'src/schemas/brand.schema';

export interface BrandCreationJobData {
  userId: Types.ObjectId;
  prompt: string;
  priority?: number;
}

export interface ColorGenerationJobData {
  brandId: Types.ObjectId;
  businessName: string;
  tagline: string;
  industry: string;
  brandStyles: string[];
  typeOfWebsite?: string
}

export enum LogoVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  ICON = 'icon',
  TEXT = 'text',
}

export enum BannerVariant {
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
}

export interface LogoRegenerationJobData {
  brandId: Types.ObjectId;
  brand: Brand
  variant: LogoVariant;
}


export interface LogoGenerationJobData {
  brandId: Types.ObjectId;
  brandName: string;
  tagline?: string;
  brandStyles: string[];
  colors: string[];
  industry: string;
  variant: LogoVariant;
}

export interface BannerGenerationJobData {
  brandId: Types.ObjectId;
  brandName: string;
  tagline?: string;
  brandStyles: string[];
  colors: string[];
  industry: string;
  variant: BannerVariant;
}

export interface WebsiteGenerationJobData {
  brandId: Types.ObjectId;
  businessName: string;
  tagline: string;
  industry: string;
  typeOfWebsite: string;
  brandStyle: string[];
}

export interface MockupGenerationJobData {
  brandId: Types.ObjectId;
}

export interface AssetAggregationJobData {
  brandId: Types.ObjectId;
  palette: string[];
  logos: { type: string; url: string }[];
  websiteJson: any;
  mockups: string[];
}

export interface JobResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  brandId?: Types.ObjectId;
}