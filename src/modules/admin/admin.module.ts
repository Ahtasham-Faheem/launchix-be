// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from 'src/schemas/user.schema';
import { Brand, BrandSchema } from 'src/schemas/brand.schema';
import { BrandAssets, BrandAssetsSchema } from 'src/schemas/assets.schema';
import { AdminGuard } from 'src/guards/admin.guard';

import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Brand.name, schema: BrandSchema },
      { name: BrandAssets.name, schema: BrandAssetsSchema },

    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
