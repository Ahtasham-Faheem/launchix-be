import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentMethod {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  token: string; // Safepay payment method token

  @Prop({ default: 'safepay' })
  provider: string;

  @Prop({ default: '' })
  label: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export type PaymentMethodDocument = HydratedDocument<PaymentMethod>;
export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);
