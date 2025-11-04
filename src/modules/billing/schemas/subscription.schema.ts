// src/billing/schemas/subscription.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BillingInterval } from './plan.schema';

export type SubscriptionDocument = HydratedDocument<Subscription>;

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'expired';

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  plan: Types.ObjectId;

  @Prop({ default: 'active', enum: ['trialing','active','past_due','canceled','expired'] })
  status: SubscriptionStatus;

  @Prop({ default: 'month', enum: ['month', 'year', 'custom'] })
  interval: BillingInterval;

  @Prop({ default: 1 })
  intervalCount: number;

  @Prop({ type: Types.ObjectId, ref: 'Coupon', default: null })
  coupon?: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  trialEndsAt?: Date | null;

  @Prop({ type: Date, required: true })
  currentPeriodStart: Date;

  @Prop({ type: Date, required: true })
  currentPeriodEnd: Date;

  @Prop({ default: false })
  cancelAtPeriodEnd: boolean;

  @Prop({ default: null })
  paymentProvider: string | null; // "stripe", "paddle", etc

  @Prop({ default: null })
  providerCustomerId: string | null;

  @Prop({ default: null })
  providerSubscriptionId: string | null;
}

export const SubscriptionSchema =
  SchemaFactory.createForClass(Subscription);
