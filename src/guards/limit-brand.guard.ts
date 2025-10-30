import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand } from 'src/modules/brand/schemas/brand.schema';
import { User } from 'src/modules/brand/schemas/user.schema';


@Injectable()
export class BrandLimitGuard implements CanActivate {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Unauthorized – user not found in request');
    }

    // Fetch user from DB to ensure latest data
    const dbUser = await this.userModel.findOne({ clerkId: user.clerkId });
    if (!dbUser) {
      throw new ForbiddenException('User not found in database');
    }

    // Count the user’s existing brands
    const brandCount = await this.brandModel.countDocuments({ owner: dbUser._id });

    // ✅ Enforce limit (free users can only have 2 brands)
    const limit = 2;
    if (!dbUser.isAdmin && brandCount >= limit) {
      throw new ForbiddenException(
        `You’ve reached your free plan limit (${limit} brands). Upgrade to create more.`,
      );
    }

    return true;
  }
}
