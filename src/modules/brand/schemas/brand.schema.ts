import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Brand {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ required: true })
  tagline: string;

  @Prop({ required: true, enum: ['Modern','Warm','Cozy','Artisan'] })
  brandStyle: string;

  @Prop({ type: Object, default: {} })
  aiFlags: Record<string, boolean>;
}
export type BrandDocument = HydratedDocument<Brand>;
export const BrandSchema = SchemaFactory.createForClass(Brand);
