import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  async signup(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.userModel.create({
      email,
      password: hashedPassword,
      verificationCode,
      verificationExpiry,
    });

    await this.mailService.sendVerificationEmail(email, verificationCode);

    return {
      success: true,
      message: 'Signup successful. Verification email sent.',
    };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('Invalid email');
    if (user.isVerified) return { message: 'Email already verified' };
    if (user.verificationCode !== code)
      throw new BadRequestException('Invalid verification code');
    if (user.verificationExpiry < new Date())
      throw new BadRequestException('Verification code expired');

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpiry = undefined;
    await user.save();

    const token = this.jwtService.sign({ id: user._id, email: user.email });
    return { success: true, userId: user._id, token };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified)
      throw new UnauthorizedException('Email not verified. Please verify your account.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ id: user._id, email: user.email });
    return { success: true, userId: user._id, token };
  }

  /**
   * ✅ Resend verification code if user's email is not verified
   */
  async resendVerification(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    // Generate new verification code
    const newCode = crypto.randomInt(100000, 999999).toString();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min validity

    user.verificationCode = newCode;
    user.verificationExpiry = verificationExpiry;

    await user.save();

    try {
      await this.mailService.resendVerificationEmail(user.email, newCode);
      return {
        success: true,
        message: 'A new verification code has been sent to your email.',
      };
    } catch (error) {
      console.error('Error sending resend email:', error);
      throw new InternalServerErrorException('Failed to resend verification email');
    }
  }

  async findOrCreateFromGoogle(profile: any) {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email) throw new Error('No email from Google');

    let user = await this.userModel.findOne({ email });
    if (!user) {
      user = await this.userModel.create({
        email,
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        isVerified: true,
        profileImage: profile.photos?.[0]?.value || '',
        // password: null or random — they authenticate via Google
      });
    }

    const token = this.jwtService.sign({ id: user._id, email: user.email });
    return { token, userId: user._id };
  }
}
