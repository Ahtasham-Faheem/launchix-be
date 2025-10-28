import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class BrandAssets {
  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Types.ObjectId;

  // 🎨 Brand color palette (hex or rgb values)
  @Prop({ type: [String], default: [] })
  palette: string[];

  // 🖼 Logos with explicit variant structure
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

  // 🌐 Website content JSON (Grapes.js compatible structure)
  @Prop({ type: Object, default: {} })
  websiteJson?: any;

  // 🧢 Product or brand mockups (image URLs)
  @Prop({ type: [String], default: [] })
  mockups?: string[];
}

export type BrandAssetsDocument = HydratedDocument<BrandAssets>;
export const BrandAssetsSchema = SchemaFactory.createForClass(BrandAssets);
