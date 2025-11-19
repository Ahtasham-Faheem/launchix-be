// src/admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from 'src/schemas/user.schema';
import { Brand, BrandDocument } from 'src/schemas/brand.schema';
import { BrandAssets, BrandAssetsDocument } from 'src/schemas/assets.schema';

import { PaginationQueryDto } from '../dto/pagination-query.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    @InjectModel(BrandAssets.name)
    private assetsModel: Model<BrandAssetsDocument>,

  ) {}

  // ---------- USERS ----------

  async listUsers(query: PaginationQueryDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    // const filter: any = { isDeleted: false };
    const filter: any = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { email: regex },
        { firstName: regex },
        { lastName: regex },
        { username: regex },
      ];
    }

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel.findById(id).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const brands = await this.brandModel
      .find({ owner: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'owner',
        select: 'firstName lastName email',
      })
      .lean();

    return {
      user,
      stats: {
        brandCount: brands.length,
      },
      brands,
    };
  }


}
