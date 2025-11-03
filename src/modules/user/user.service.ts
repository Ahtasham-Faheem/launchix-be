// src/user/user.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { Brand, BrandDocument } from 'src/schemas/brand.schema';
import { BrandAssets, BrandAssetsDocument } from 'src/schemas/assets.schema';


@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    private clerk;

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
        @InjectModel(BrandAssets.name) private brandAssetModel: Model<BrandAssetsDocument>,
        private readonly config: ConfigService
    ) {
        this.clerk = createClerkClient({
            secretKey: this.config.get<string>('CLERK_SECRET_KEY'),
        });
    }

    /** 🧩 Find user by Clerk ID */
    async findByClerkId(clerkId: string) {
        const user = await this.userModel.findOne({ clerkId });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    /** 🧹 Soft delete user */
    async softDeleteUser(userId: string) {
        const user = await this.userModel.findOne({ _id: userId });
        if (!user) throw new NotFoundException('User not found');
        console.log('user', user)
        try {
            // 1️⃣ Delete user from Clerk
            await this.clerk.users.deleteUser(user.clerkId);

            // 2️⃣ Mark as deleted in MongoDB
            user.isDeleted = true;
            user.deletedAt = new Date();
            await user.save();

            this.logger.warn(`Soft deleted user ${user.email} (${user.clerkId})`);
            return { message: 'User deleted successfully', user };
        } catch (err) {
            this.logger.error(`Failed to soft delete user ${user.clerkId}: ${err.message}`);
            throw err;
        }
    }

    async hardDeleteUser(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        try {
            // 1️⃣ Delete user from Clerk
            if (user.clerkId) {
                await this.clerk.users.deleteUser(user.clerkId);
                this.logger.log(`Deleted user from Clerk: ${user.clerkId}`);
            }

            // 2️⃣ Find all brands linked to this user
            const brands = await this.brandModel.find({ owner: user._id });

            for (const brand of brands) {
                // 3️⃣ Delete all brand assets linked to each brand
                if (this.brandAssetModel) {
                    const deletedAssets = await this.brandAssetModel.deleteMany({ brandId: brand._id });
                    this.logger.log(`Deleted ${deletedAssets.deletedCount} assets for brand ${brand.businessName}`);
                }

                // 4️⃣ Delete brand itself
                await this.brandModel.deleteOne({ _id: brand._id });
                this.logger.log(`Deleted brand: ${brand.businessName} (${brand._id})`);
            }

            // 5️⃣ Finally, delete the user from MongoDB
            await this.userModel.deleteOne({ _id: user._id });
            this.logger.warn(`Hard deleted user ${user.email} (${user.clerkId}) and ${brands.length} related brands`);

            return {
                message: 'User and all associated data permanently deleted',
                deletedBrands: brands.length,
            };
        } catch (err) {
            this.logger.error(`Failed to hard delete user ${user._id}: ${err.message}`);
            throw err;
        }
    }
}
