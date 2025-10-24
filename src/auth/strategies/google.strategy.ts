import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { CONFIG } from 'src/config/constants';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: CONFIG.GOOGLE.CLIENT_ID,
      clientSecret: CONFIG.GOOGLE.CLIENT_SECRET,
      callbackURL: CONFIG.GOOGLE.REDIRECT_URI,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const user = await this.authService.findOrCreateFromGoogle(profile);
    return user; // this attaches to req.user
  }
}
