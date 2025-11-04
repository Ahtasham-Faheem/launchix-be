// src/billing/schemas/coupon.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true })
  code: string; // e.g. "LAUNCH10"

  @Prop({ type: Number, default: 0 })
  percentOff?: number; // 10 = 10%

  @Prop({ type: Number, default: 0 })
  amountOff?: number; // in cents

  @Prop({ type: [Types.ObjectId], ref: 'Plan', default: [] })
  applicablePlans?: Types.ObjectId[];

  @Prop({ default: 'once', enum: ['once', 'repeating', 'forever'] })
  duration: 'once' | 'repeating' | 'forever';

  @Prop({ default: null })
  durationInMonths?: number | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  validUntil?: Date | null;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
