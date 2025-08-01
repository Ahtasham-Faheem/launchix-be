// project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true, unique: true })
  projectId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  projectName: string;

  @Prop({
    type: Object,
    default: {
      businessName: '',
      tagline: '',
      industry: '',
      businessType: '',
      brandStyle: [],
      brandColors: '',
      brandMission: '',
      companyLogo: '',
      completed: false
    },
  })
  businessDetails: {
    businessName?: string;
    tagline?: string;
    industry?: string;
    businessType?: string;
    brandStyle?: string[];
    brandColors?: string;
    brandMission?: string;
    companyLogo?: string;
    completed?: boolean;
  };

  @Prop({ type: Number, enum: [1, 2, 3, 4], default: 1 })
  currentStep: number;

  @Prop({ type: Object, required: true })
  data: any;

  @Prop({ type: String })
  thumbnail?: string;

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);