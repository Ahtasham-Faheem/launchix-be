import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { SafepayService } from 'src/modules/payments/services/safepay.service';


@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    // private readonly safepayService: SafepayService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No authorization token provided');
    }

    const token = authHeader.substring(7);

    try {
      let user;

      if (process.env.NODE_ENV === 'development') {
        const devId =
          process.env.CLERK_DEV_USER_ID || 'user_34yCUuvfa5WOv4LiujEeJJx9YzY';
        user = await clerkClient.users.getUser(devId);
      } else {
        const issuer = `https://${process.env.CLERK_DOMAIN}`;
        const sessionClaims = await clerkClient.verifyToken(token, { issuer });

        if (!sessionClaims?.sub)
          throw new UnauthorizedException('Invalid Clerk token');

        user = await clerkClient.users.getUser(sessionClaims.sub);
      }

      const localUser = await this.findOrCreateLocalUser(user);

      // // ✅ Auto-create Safepay Customer if missing
      // if (!localUser.metadata?.safepayCustomerToken) {
      //   const safepayCustomer = await this.safepayService.createCustomer({
      //     userId: localUser._id.toString(),
      //     email: localUser.email,
      //     firstName: localUser.firstName,
      //     lastName: localUser.lastName,
      //     country: 'PK', // default
      //   });

      //   localUser.metadata = {
      //     ...localUser.metadata,
      //     safepayCustomerToken: safepayCustomer.customerToken,
      //   };
      //   await localUser.save();

      //   this.logger.log(
      //     `Safepay customer created for ${localUser.email} (${localUser._id})`,
      //   );
      // }

      request.user = localUser;
      return true;
    } catch (error) {
      this.logger.error('AuthGuard Error', error);
      throw new UnauthorizedException(
        'Token verification failed: ' + error.message,
      );
    }
  }

  private async findOrCreateLocalUser(clerkUser: any): Promise<UserDocument> {
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    const existingUser = await this.userModel.findOne({ clerkId: clerkUser.id });
    if (existingUser) return existingUser;

    const newUser = new this.userModel({
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      profileImage: clerkUser.imageUrl,
      username: clerkUser.username,
      metadata: clerkUser.publicMetadata,
      role: clerkUser?.publicMetadata?.role || 'user',
    });

    return newUser.save();
  }
}
