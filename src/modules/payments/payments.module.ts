import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SafepayService } from './services/safepay.service';
import { SafepayController } from './controllers/safepay.controller';
import { SafepayCustomer, SafepayCustomerSchema } from './schemas/safepay-customer.schema';
import { PaymentMethod, PaymentMethodSchema } from './schemas/payment-method.schema';
import { Plan, PlanSchema } from '../billing/schemas/plan.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SafepayCustomer.name, schema: SafepayCustomerSchema },
      { name: PaymentMethod.name, schema: PaymentMethodSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SafepayController],
  providers: [SafepayService],
  exports: [SafepayService, MongooseModule],
})
export class PaymentsModule { }
