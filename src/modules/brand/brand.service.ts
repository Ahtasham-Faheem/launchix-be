import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Brand } from './schemas/brand.schema';
import { User } from './schemas/user.schema';
import { BrandAssets } from './schemas/assets.schema';
import { AiService, BrandFields } from '../ai/ai.service';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(BrandAssets.name) private assetsModel: Model<BrandAssets>,
    private readonly ai: AiService,
  ) { }

  async upsertUser(clerk: { userId: string; email?: string; firstName?: string; lastName?: string; }) {
    const found = await this.userModel.findOneAndUpdate(
      { clerkId: clerk.userId },
      { $set: { email: clerk.email, firstName: clerk.firstName, lastName: clerk.lastName } },
      { new: true, upsert: true }
    );
    return found;
  }

  async createFromPrompt(ownerClerk: any, prompt: string) {
    const owner = await this.upsertUser(ownerClerk);
    const parsed = await this.ai.extractFromPrompt(prompt);

    // 🧠 If AI detected issues or returned an error, stop here
    if ('errors' in parsed && parsed.errors.length > 0) {
      return {
        success: false,
        message: 'Prompt validation failed',
        errors: parsed.errors,
      };
    }

    // ✅ If prompt is valid, create brand
    if ('errors' in parsed && parsed.errors.length > 0) {
      throw new Error('Unexpected state: parsed contains errors');
    }

    const data = { ...parsed } as BrandFields;
    const brand = await this.brandModel.create({
      owner: owner._id,
      businessName: data.businessName,
      industry: data.industry,
      tagline: data.tagline,
      brandStyle: data.brandStyle,
      aiFlags: data.aiFlags,
    });

    return brand;
  }

  async regenerate(brandId: string, fields: any) {
    const brand = await this.brandModel.findById(brandId);
    if (!brand) throw new NotFoundException('Brand not found');
    const regen = await this.ai.regenerate(fields, brand.toObject());
    Object.assign(brand, regen);
    await brand.save();
    return brand;
  }

  async buildAssets(brandId: string) {
    const brand = await this.brandModel.findById(brandId);
    if (!brand) throw new NotFoundException('Brand not found');
    const palette = this.ai.pickColors(brand.brandStyle);
    const logos = await this.ai.generateLogos(brand.businessName, palette);
    const websiteJson = await this.ai.generateWebsiteJson(brand.toObject(), palette);
    const mockups = await this.ai.createMockups();
    const assets = await this.assetsModel.findOneAndUpdate(
      { brand: new Types.ObjectId(brandId) },
      { $set: { palette, logos, websiteJson, mockups } },
      { new: true, upsert: true }
    );
    return assets;
  }

  async getBrand(brandId: string) {
    const brand = await this.brandModel.findById(brandId).populate('owner');
    if (!brand) throw new NotFoundException('Brand not found');
    const assets = await this.assetsModel.findOne({ brand: brand._id });
    return { brand, assets };
  }
}
