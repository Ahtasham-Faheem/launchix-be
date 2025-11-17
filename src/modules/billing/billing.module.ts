import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillingService } from './services/billing.service';
import { BillingController } from './controllers/billing.controller';
import { AdminBillingController } from './controllers/admin-billing.controller';
import { BillingWebhookController } from './controllers/webhook.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { BillingCron } from './billing.cron';

import { Plan, PlanSchema } from './schemas/plan.schema';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';

import { User, UserSchema } from 'src/schemas/user.schema';
import { MailModule } from 'src/shared/mail/mail.module';
import { CouponController } from './controllers/coupon.controller';
import { CouponService } from './services/coupon.service';
import { PaymentsModule } from '../payments/payments.module';
// import { PaymentMethod, PaymentMethodSchema } from '../payments/schemas/payment-method.schema';

@Module({
  imports: [
    // Mongo models for billing
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: User.name, schema: UserSchema },
      // { name: PaymentMethod.name, schema: PaymentMethodSchema },
    ]),
    // Resend-based mail service
    MailModule,
    PaymentsModule,
  ],
  controllers: [
    BillingController,
    AdminBillingController,
    BillingWebhookController,
    StripeWebhookController,
    CouponController
  ],
  providers: [BillingService, BillingCron, CouponService],
  exports: [BillingService, CouponService], // so BrandLimitGuard or BrandService can use it
})
export class BillingModule {}
