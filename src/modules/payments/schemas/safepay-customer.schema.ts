import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SafepayCustomer {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  customerToken: string; // Safepay customer token

  @Prop({ required: true })
  merchantApiKey: string; // Safepay customer token

  @Prop({ default: 'safepay' })
  provider: string;
}

export type SafepayCustomerDocument = HydratedDocument<SafepayCustomer>;
export const SafepayCustomerSchema =
  SchemaFactory.createForClass(SafepayCustomer);
