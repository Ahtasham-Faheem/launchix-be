// src/billing/schemas/invoice.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InvoiceDocument = HydratedDocument<Invoice>;

export type InvoiceStatus =
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible';

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subscription', required: true })
  subscription: Types.ObjectId;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  amountDue: number; // in cents

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop({ default: 0 })
  amountRemaining: number;

  @Prop({ default: 'draft', enum: ['draft','open','paid','void','uncollectible'] })
  status: InvoiceStatus;

  @Prop({ type: Date, required: true })
  dueDate: Date;

  @Prop({ type: Date, default: null })
  paidAt?: Date | null;

  @Prop({ type: Date, default: null })
  sentAt?: Date | null;

  @Prop({ default: null })
  providerInvoiceId?: string | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
