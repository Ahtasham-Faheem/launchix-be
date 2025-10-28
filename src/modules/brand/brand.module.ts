import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './schemas/brand.schema';
import { User, UserSchema } from './schemas/user.schema';
import { BrandAssets, BrandAssetsSchema } from './schemas/assets.schema';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { AiModule } from '../ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    AiModule,
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: User.name, schema: UserSchema },
      { name: BrandAssets.name, schema: BrandAssetsSchema },
    ]),
  ],
  providers: [BrandService],
  controllers: [BrandController],
})
export class BrandModule {}
