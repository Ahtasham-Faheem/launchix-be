import { Types } from 'mongoose';

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
}

export interface LogoGenerationJobData {
  brandId: Types.ObjectId;
  brandName: string;
  tagline?: string;
  brandStyles: string[];
  colors: string[];
  variant: 'primary' | 'secondary' | 'icon' | 'text';
}

export interface WebsiteGenerationJobData {
  brandId: Types.ObjectId;
  businessName: string;
  tagline: string;
  industry: string;
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