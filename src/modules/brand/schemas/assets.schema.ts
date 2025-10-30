import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class BrandAssets {
  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Types.ObjectId;

  @Prop({ type: String, default: '' })
  vision: string;
  
  @Prop({ type: String, default: '' })
  mission: string;
  
  @Prop({ type: [String], default: null })
  palette: string[];
  
  @Prop({ type: Object, default: null })
  typography: any;

  @Prop({
    type: [
      {
        type: { type: String, required: true }, // e.g., "Primary Logo"
        url: { type: String, required: true },   // S3 or DALL·E URL
      },
    ],
    default: [],
  })
  logos: { type: string; url: string }[];

  @Prop({ type: Object, default: null })
  website: any;

  @Prop({ type: [String], default: [] })
  mockups?: string[];
}

export type BrandAssetsDocument = HydratedDocument<BrandAssets>;
export const BrandAssetsSchema = SchemaFactory.createForClass(BrandAssets);
