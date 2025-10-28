import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';

// Extend the Express Request interface to include user data
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      username: string | null;
      imageUrl: string;
      fullProfile: any;
    };
  }
}

@Injectable()
export class ClerkAuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract the token from the Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No authorization token provided');
      }

      // Get the token (remove 'Bearer ' prefix)
      const token = authHeader.substring(7);

      // Verify the token with Clerk
      // The issuer should be your Clerk frontend API URL
      const issuer = `https://${process.env.CLERK_DOMAIN}`;
      
      const sessionClaims = await clerkClient.verifyToken(token, {
        issuer: issuer,
      });

      if (!sessionClaims || !sessionClaims.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      // Get the user ID from the token claims
      const userId = sessionClaims.sub;

      // Fetch the full user profile from Clerk
      const user = await clerkClient.users.getUser(userId);

      // Attach the user profile to the request object
      req.user = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        fullProfile: user, // Include the complete profile if needed
      };

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Token verification failed: ' + error.message);
    }
  }
}