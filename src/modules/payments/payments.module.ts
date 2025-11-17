import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SafepayService } from './services/safepay.service';
import { SafepayController } from './controllers/safepay.controller';
import { StripeService } from './services/stripe.service';
import { StripeController } from './controllers/stripe.controller';
// import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import {
  SafepayCustomer,
  SafepayCustomerSchema,
} from './schemas/safepay-customer.schema';
import {
  StripeCustomer,
  StripeCustomerSchema,
} from './schemas/stripe-customer.schema';
import {
  PaymentMethod,
  PaymentMethodSchema,
} from './schemas/payment-method.schema';
import { Plan, PlanSchema } from '../billing/schemas/plan.schema';
import { Subscription, SubscriptionSchema } from '../billing/schemas/subscription.schema';
import { Coupon, CouponSchema } from '../billing/schemas/coupon.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SafepayCustomer.name, schema: SafepayCustomerSchema },
      { name: StripeCustomer.name, schema: StripeCustomerSchema },
      { name: PaymentMethod.name, schema: PaymentMethodSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SafepayController, StripeController],
  providers: [SafepayService, StripeService],
  exports: [SafepayService, StripeService, MongooseModule],
})
export class PaymentsModule {}
