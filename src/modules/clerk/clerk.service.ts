import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';

@Injectable()
export class ClerkService {
  private clerk;

  constructor(private readonly config: ConfigService) {
    this.clerk = createClerkClient({
      secretKey: this.config.get<string>('CLERK_SECRET_KEY'),
    });
  }

  async loginUser(email: string, password: string) {
    try {
      // 1️⃣ Find the user in Clerk
      const users = await this.clerk.users.getUserList({ emailAddress: [email] });

      if (!users || users.length === 0) {
        throw new NotFoundException(`User not found in Clerk: ${email}`);
      }

      const user = users.data[0];

      // 2️⃣ Mock password check (Clerk doesn't allow password verification in backend)
      if (password !== '12345678') {
        throw new BadRequestException('Invalid password (for testing).');
      }

      // 3️⃣ Create a Clerk session
      const session = await this.clerk.sessions.createSession({
        userId: user.id,
      });

      // 4️⃣ Retrieve a JWT for the session
      const token = await this.clerk.sessions.createToken(session.id);

      // 5️⃣ Return the JWT and user info
      return {
        message: 'User verified successfully.',
        userId: user.id,
        email: user.emailAddresses[0].emailAddress,
        jwt: token.jwt,
      };
    } catch (error) {
      console.error('❌ ClerkService.loginUser error:', error);
      throw new InternalServerErrorException(error.message || 'Failed to get Clerk JWT');
    }
  }
}
