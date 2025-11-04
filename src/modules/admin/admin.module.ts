// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from 'src/schemas/user.schema';
import { Brand, BrandSchema } from 'src/schemas/brand.schema';
import {
  BrandAssets,
  BrandAssetsSchema,
} from 'src/schemas/assets.schema';
import { AdminGuard } from 'src/guards/admin.guard';
import { Invoice, InvoiceSchema } from '../billing/schemas/invoice.schema';
import { Plan, PlanSchema } from '../billing/schemas/plan.schema';
import { Subscription, SubscriptionSchema } from '../billing/schemas/subscription.schema';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { Coupon, CouponSchema } from '../billing/schemas/coupon.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Brand.name, schema: BrandSchema },
      { name: BrandAssets.name, schema: BrandAssetsSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
