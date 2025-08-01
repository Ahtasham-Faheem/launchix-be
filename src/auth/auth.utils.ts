import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/schemas/user.schema';
import { UnauthorizedException } from '@nestjs/common';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}

export async function sendVerificationEmail(
  mailService: MailService,
  email: string,
  code: string,
) {
  await mailService.sendVerificationEmail(email, code);
}

export const verifyToken = (
  authHeader: string | undefined,
): { id: string; email: string } => {
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    throw new UnauthorizedException('Token not provided');
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id || !decoded.email) {
      throw new UnauthorizedException('User ID or email not found in token');
    }
    return { id: decoded.id, email: decoded.email };
  } catch (error) {
    console.error('Token verification error:', error);
    throw new UnauthorizedException('Invalid or expired token');
  }
};
