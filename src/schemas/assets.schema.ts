import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class BrandAssets {
  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Types.ObjectId;

  @Prop({ type: String, default: '' })
  vision: string;
  // store previous vision values
  @Prop({ type: [String], default: [] })
  visionHistory?: string[];

  @Prop({ type: String, default: '' })
  mission: string;
  // store previous mission values
  @Prop({ type: [String], default: [] })
  missionHistory?: string[];

  @Prop({ type: [String], default: null })
  palette: string[];
  // store previous palette snapshots (each entry is an array of hex strings)
  @Prop({ type: [[String]], default: [] })
  paletteHistory?: string[][];

  @Prop({ type: Object, default: null })
  typography: any;
  // store previous typography snapshots
  @Prop({ type: [Object], default: [] })
  typographyHistory?: any[];

  @Prop({
    type: [
      {
        type: { type: String, required: true }, // e.g., "Primary Logo"
        url: { type: String, required: true },   // S3 or DALL·E URL
      },
    ],
    default: [],
  })
  logos: { type: string; url: string }[];
  // history of logos snapshots (each entry is an array of logo objects)
  @Prop({ type: [Object], default: [] })
  logosHistory?: any[];

  @Prop({
    type: [
      {
        type: { type: String, required: true }, // e.g., "Primary Banner"
        url: { type: String, required: true },
      },
    ],
    default: [],
  })
  banners: { type: string; url: string }[];
  // history of banner snapshots
  @Prop({ type: [Object], default: [] })
  bannersHistory?: any[];

  @Prop({ type: Object, default: null })
  website: any;
  // history of website snapshots
  @Prop({ type: [Object], default: [] })
  websiteHistory?: any[];

  @Prop({ type: [String], default: [] })
  mockups?: string[];
  // history of mockups (each entry can be an array snapshot or a string entry depending on your usage)
  @Prop({ type: [[String]], default: [] })
  mockupsHistory?: string[][];
}

export type BrandAssetsDocument = HydratedDocument<BrandAssets>;
export const BrandAssetsSchema = SchemaFactory.createForClass(BrandAssets);