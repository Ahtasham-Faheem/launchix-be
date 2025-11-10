import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../guards/auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user.schema';
import { SafepayService } from '../payments/services/safepay.service';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentMethod, PaymentMethodSchema } from '../payments/schemas/payment-method.schema';
import { SafepayCustomer, SafepayCustomerSchema } from '../payments/schemas/safepay-customer.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SafepayCustomer.name, schema: SafepayCustomerSchema }, // Add this
      { name: PaymentMethod.name, schema: PaymentMethodSchema },
    ]),
    PaymentsModule
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
