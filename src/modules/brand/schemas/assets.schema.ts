import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class BrandAssets {
  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  palette: string[];

  @Prop({ type: [String], default: [] })
  logos: string[];

  @Prop({ type: Object })
  websiteJson?: any;

  @Prop({ type: [String], default: [] })
  mockups?: string[];
}
export type BrandAssetsDocument = HydratedDocument<BrandAssets>;
export const BrandAssetsSchema = SchemaFactory.createForClass(BrandAssets);
