import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    try {
      // Extract the token from the Authorization header
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No authorization token provided');
      }

      const token = authHeader.substring(7);

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

      // Attach the user profile to the request object
      request.user = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        fullProfile: user,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token verification failed: ' + error.message);
    }
  }
}

// Usage example in a controller:
// @Controller('protected')
// @UseGuards(ClerkAuthGuard)
// export class ProtectedController {
//   @Get()
//   getProtectedData(@Req() req: Request) {
//     return { user: req.user };
//   }
// }