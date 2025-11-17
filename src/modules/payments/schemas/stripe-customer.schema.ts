import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class StripeCustomer {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  stripeCustomerId: string;

  @Prop()
  email?: string;

  @Prop({ type: Object, default: {} })
  metadata?: any;
}

export type StripeCustomerDocument = HydratedDocument<StripeCustomer>;
export const StripeCustomerSchema = SchemaFactory.createForClass(StripeCustomer);