import { Body, Controller, Get, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { CONFIG } from 'src/config/constants';
import { JwtService } from '@nestjs/jwt';
import ResponseHelper from 'src/utils/response-helper';
import { ApiOperation } from '@nestjs/swagger';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly jwtService: JwtService) { }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const data = await this.authService.signup(createUserDto);
    return ResponseHelper.createResponse({}, HttpStatus.OK, data.message);
  }

  @ApiOperation({ summary: 'Verify email address using verification code' })
  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    const data = await this.authService.verifyEmail(body.email, body.code);
    return ResponseHelper.createResponse({ userId: data.userId, token: data.token }, HttpStatus.OK, data.message);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const data = await this.authService.login(loginUserDto);
    return ResponseHelper.createResponse({ userId: data.userId, token: data.token }, HttpStatus.OK, 'Login successful');
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


  // Google will redirect back to here
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // req.user is object returned via done(null, user) in strategy.validate
    const user = req.user as any;
    // Here we can set cookie or redirect with token
    // Example: redirect to frontend with token as query (avoid for production—use httpOnly cookie)
    const frontendUrl = CONFIG.GOOGLE.FRONTEND_LANDING_URL;
    // user.token should be created in authService.findOrCreateFromGoogle
    return res.redirect(`${frontendUrl}?token=${user.token}`);
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
