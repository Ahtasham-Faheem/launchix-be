import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebsiteDocument = Website & Document;

@Schema({ timestamps: true })
export class Website {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ required: true })
  tagline: string;

  @Prop()
  vision: string;

  @Prop()
  mission: string;

  @Prop()
  logoUrl: string;

  @Prop({ type: Object })
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };

  @Prop({ type: [String] })
  sections: string[];

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop()
  contactEmail?: string;

  @Prop()
  contactPhone?: string;

  @Prop({ type: Object })
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };

  @Prop({ required: true, type: String })
  htmlContent: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  publicUrl: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  domain?: string; // Custom domain if user maps one

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: Object })
  seoMetadata?: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };

  @Prop({ type: String, enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const WebsiteSchema = SchemaFactory.createForClass(Website);

// Indexes
WebsiteSchema.index({ userId: 1, createdAt: -1 });
WebsiteSchema.index({ publicUrl: 1 }, { unique: true });
WebsiteSchema.index({ domain: 1 }, { sparse: true });