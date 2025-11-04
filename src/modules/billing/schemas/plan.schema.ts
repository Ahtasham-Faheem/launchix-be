// src/billing/schemas/plan.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlanDocument = HydratedDocument<Plan>;

export type BillingInterval = 'month' | 'year' | 'custom';

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true, unique: true })
  code: string; // e.g. "starter", "pro", "enterprise"

  @Prop({ required: true })
  name: string; // title displayed to users

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: 'usd' })
  currency: string; // e.g. "usd"

  @Prop({ required: true })
  amount: number; // in smallest unit (e.g. cents)

  @Prop({ required: true, enum: ['month', 'year', 'custom'], default: 'month' })
  interval: BillingInterval;

  @Prop({ default: 1 })
  intervalCount: number; // 1 month, 12 months, etc

  @Prop({ default: 0 })
  maxBrands: number; // 2, 10, 0 for unlimited

  @Prop({ type: [String], default: [] })
  features: string[]; // UI-only bullets

  @Prop({ default: false })
  isPopular: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
