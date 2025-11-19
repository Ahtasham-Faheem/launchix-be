import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Brand {
  [x: string]: any;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'BrandAssets', required: false })
  brandAsset: Types.ObjectId;

  @Prop({})
  prompt?: string;
  
  @Prop({})
  typeOfWebsite?: string;
  
  @Prop({})
  template?: string;
  
  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ required: true })
  tagline: string;

  @Prop({ required: true, type: [String] })
  brandStyle: string[];

  @Prop({ type: Object, default: {} })
  aiFlags: Record<string, boolean>;
  
  @Prop({ type: String, default: null })
  subdomain?: string;

  @Prop({ type: String, default: null })
  publishedUrl?: string;
}
export type BrandDocument = HydratedDocument<Brand>;
export const BrandSchema = SchemaFactory.createForClass(Brand);
