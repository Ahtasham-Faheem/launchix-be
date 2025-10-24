import { Body, Controller, Get, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import ResponseHelper from 'src/utils/response-helper';
import { ApiOperation } from '@nestjs/swagger';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) { }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const data = await this.authService.signup(createUserDto);
    return ResponseHelper.createResponse({}, HttpStatus.OK, data.message);
  }

  @ApiOperation({ summary: 'Verify email address using verification code' })
  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    const data = await this.authService.verifyEmail(body.email, body.code);
    return ResponseHelper.createResponse({ token: data.token }, HttpStatus.OK, data.message);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const data = await this.authService.login(loginUserDto);
    return ResponseHelper.createResponse({ token: data.token }, HttpStatus.OK, 'Login successful');
  }

  /**
 * ✅ Resend Verification Email
 * @route POST /auth/resend-verification
 * @body { email: string }
 */
  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    const data = await this.authService.resendVerification(email);
    return ResponseHelper.createResponse({}, HttpStatus.OK, data.message);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return { message: 'Redirecting to Google...' };
  }


  /**
   * ✅ Google OAuth Callback
   * Google redirects to this route after successful authentication
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any; // Returned from strategy.validate()

    if (!user || !user.token) {
      return res.status(400).json({ message: 'Authentication failed' });
    }

    // Dynamically load the frontend redirect URL from ConfigService
    const frontendUrl = this.configService.get<string>('GOOGLE_FRONTEND_LANDING_URL');

    if (!frontendUrl) {
      console.error('⚠️ Missing GOOGLE_FRONTEND_LANDING_URL in .env');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Option 1: Redirect with token in query string (simple for development)
    return res.redirect(`${frontendUrl}?token=${user.token}`);

    // Option 2 (recommended for production):
    // res.cookie('auth_token', user.token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    // });
    // return res.redirect(frontendUrl);
  }


  @Get('verify-token')
  async verifyToken(@Req() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');

    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);

      return ResponseHelper.createResponse({ valid: true, user: decoded }, HttpStatus.OK, 'Token is valid');
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

}
