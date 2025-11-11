import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../guards/auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    AuthService,
    AuthGuard,
  ],
  exports: [
    AuthService,
    AuthGuard,
    MongooseModule
  ],
})
export class AuthModule { }
