import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Brand } from '../../schemas/brand.schema';
import { User } from '../../schemas/user.schema';
import { BrandAssets } from '../../schemas/assets.schema';
import { AiService, BrandFields } from '../ai/ai.service';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(BrandAssets.name) private assetsModel: Model<BrandAssets>,
    private readonly ai: AiService,
  ) { }

  async upsertUser(clerk: {
    id: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  }) {

    const found = await this.userModel.findOneAndUpdate(
      { clerkId: clerk.id },
      {
        $set: {
          email: clerk.email,
          firstName: clerk.firstName,
          lastName: clerk.lastName,
          username: clerk.username,
          profileImage: clerk.imageUrl,
        }
      },
      { new: true, upsert: true },
    );
    return found;
  }


  async getUserBrands(owner: string) {
    return this.brandModel
      .find({ owner })
      .sort({ createdAt: -1 })
      .lean();
  }

  async createFromPrompt(user: any, prompt: string) {
    const parsed = await this.ai.extractFromPrompt(prompt);

    if ('errors' in parsed && parsed.errors.length > 0) {
      return {
        success: false,
        message: 'Prompt validation failed',
        errors: parsed.errors,
      };
    }

    if ('errors' in parsed && parsed.errors.length > 0) {
      throw new Error('Unexpected state: parsed contains errors');
    }

    const data = { ...parsed } as BrandFields;
    const brand = await this.brandModel.create({
      owner: user._id,
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

  async getBrand(brandId: string) {
    const brand = await this.brandModel.findById(brandId).populate('owner');
    if (!brand) throw new NotFoundException('Brand not found');

    const assets = await this.assetsModel.findOne({ brand: brand._id });
    return { brand, assets };
  }

  async getBrandById(brandId: string) {
    const brand = await this.brandModel.findById(brandId);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async getBrandAssets(brandId: string) {
    const assets = await this.assetsModel.findOne({
      brand: new Types.ObjectId(brandId)
    });
    return assets;
  }


  /**
  * ✅ Update a brand with partial or full data
  */
  async updateBrand(brandId: string, updateData: Partial<UpdateBrandDto>): Promise<Brand> {
    if (!Types.ObjectId.isValid(brandId)) {
      throw new BadRequestException('Invalid Brand ID');
    }

    const updatedBrand = await this.brandModel.findByIdAndUpdate(
      brandId,
      { $set: updateData },
      { new: true },
    );

    if (!updatedBrand) {
      throw new NotFoundException('Brand not found');
    }

    return updatedBrand;
  }


  /**
   * ✅ Delete Brand and its linked Assets
   */
  async deleteBrandAndAssets(brandId: string, ownerId: string) {
    const brand = await this.brandModel.findOne({ _id: brandId, owner: ownerId });
    if (!brand) throw new NotFoundException('Brand not found or not owned by this user');

    // Delete assets associated with the brand
    await this.assetsModel.deleteOne({ brand: brand._id });

    // Delete brand itself
    await this.brandModel.deleteOne({ _id: brand._id });

    return {
      success: true,
      message: 'Brand and associated assets deleted successfully',
      brandId,
    };
  }

  /**
   * ✅ Check Brand Limit
   */
  async checkBrandLimit(ownerId: string, maxLimit: number) {
    const count = await this.brandModel.countDocuments({ owner: ownerId });
    const remaining = Math.max(0, maxLimit - count);

    return {
      limit: maxLimit,
      used: count,
      remaining,
      canCreateMore: remaining > 0,
    };
  }
}