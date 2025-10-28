import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';
import type { ClerkUser } from '../../shared/types';

@Injectable()
export class AuthService {
  private clerk;

  constructor(private readonly config: ConfigService) {
    // Initialize Clerk client using ConfigService values
    this.clerk = createClerkClient({
      secretKey: this.config.get<string>('CLERK_SECRET_KEY'),
    });
  }

  async verify(token?: string): Promise<ClerkUser> {
    console.log('🔐 Verifying token...');

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      // ✅ Method 1: Verify JWT token directly (Recommended)
      const decoded = await this.clerk.verifyToken(token, {
        // Optional: Add audience validation if configured
        // audience: this.config.get<string>('CLERK_JWT_AUDIENCE'),
      });

      console.log('✅ Token verified:', decoded.sub);

      // Get user profile from Clerk using the subject (user ID)
      const user = await this.clerk.users.getUser(decoded.sub);

      return {
        userId: user.id,
        email: user?.primaryEmailAddress?.emailAddress || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
      };
    } catch (err: any) {
      console.error('❌ Clerk verification failed:', err.message);

      // Provide more specific error messages
      if (err.message?.includes('expired')) {
        throw new UnauthorizedException('Token has expired');
      }

      if (err.message?.includes('invalid')) {
        throw new UnauthorizedException('Invalid token signature');
      }

      throw new UnauthorizedException('Invalid Clerk token');
    }
  }
}
