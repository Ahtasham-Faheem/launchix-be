// src/user/user.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    private clerk;

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
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
}
