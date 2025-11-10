import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SafepayService } from './services/safepay.service';
import { SafepayController } from './controllers/safepay.controller';
import { SafepayCustomer, SafepayCustomerSchema } from './schemas/safepay-customer.schema';
import { PaymentMethod, PaymentMethodSchema } from './schemas/payment-method.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SafepayCustomer.name, schema: SafepayCustomerSchema },
      { name: PaymentMethod.name, schema: PaymentMethodSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SafepayController],
  providers: [SafepayService],
  exports: [SafepayService, MongooseModule],
})
export class PaymentsModule { }
