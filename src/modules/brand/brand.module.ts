import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { Brand, BrandSchema } from '../../schemas/brand.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { BrandAssets, BrandAssetsSchema } from '../../schemas/assets.schema';
import { AiModule } from '../ai/ai.module';
import { QueueModule } from '../queue/queue.module';
import { BrandLimitGuard } from 'src/guards/limit-brand.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: User.name, schema: UserSchema },
      { name: BrandAssets.name, schema: BrandAssetsSchema },
    ]),
    AiModule,
    QueueModule,
  ],
  controllers: [BrandController],
  providers: [BrandService, BrandLimitGuard],
  exports: [BrandService],
})
export class BrandModule {}