import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Extract the token from the Authorization header
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No authorization token provided');
      }

      const token = authHeader.substring(7);


      if (process.env.NODE_ENV === 'development') {
        const userId = process.env.CLERK_DEV_USER_ID || 'user_34yCUuvfa5WOv4LiujEeJJx9YzY';

        // Fetch the full user profile from Clerk
        const user = await clerkClient.users.getUser(userId);

        const localUser = await this.findOrCreateLocalUser(user);

        request.user = localUser;
        return true;
      }

      // Verify the token with Clerk
      const issuer = `https://${process.env.CLERK_DOMAIN}`;

      const sessionClaims = await clerkClient.verifyToken(token, {
        issuer: issuer,
      });

      if (!sessionClaims || !sessionClaims.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      const userId = sessionClaims.sub;

      // Fetch the full user profile from Clerk
      const user = await clerkClient.users.getUser(userId);

      const localUser = await this.findOrCreateLocalUser(user);

      // Attach the user profile to the request object
      request.user = localUser;

      return true;
    } catch (error) {
      console.log('data', error)
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token verification failed: ' + error.message);
    }
  }


  /**
  * ✅ Finds the user in MongoDB or creates it if not found.
  */
  private async findOrCreateLocalUser(clerkUser: any): Promise<User> {
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
      role: clerkUser?.publicMetadata?.role || 'user'
    });

    return newUser.save();
  }
}
