// src/user/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  clerkId: string;

  @Prop() email?: string;
  @Prop() firstName?: string;
  @Prop() lastName?: string;
  @Prop() username?: string;
  @Prop() profileImage?: string;

  @Prop({ default: false }) isAdmin: boolean;
  @Prop({ default: 'user' }) role: boolean;
  
  @Prop({ type: Object, default: {} })
  metadata: any;

  /** ✅ Soft delete fields */
  @Prop({ default: false }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
