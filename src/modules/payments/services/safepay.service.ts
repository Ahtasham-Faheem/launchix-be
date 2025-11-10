import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Safepay from '@sfpy/node-core';
import { SafepayCustomer, SafepayCustomerDocument } from '../schemas/safepay-customer.schema';
import { PaymentMethod, PaymentMethodDocument } from '../schemas/payment-method.schema';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { ChargeSubscriptionDto } from '../dto/charge-subscription.dto';

@Injectable()
export class SafepayService {
  private readonly logger = new Logger(SafepayService.name);
  private safepayClient: any;

  constructor(
    @InjectModel(SafepayCustomer.name)
    private customerModel: Model<SafepayCustomerDocument>,
    @InjectModel(PaymentMethod.name)
    private paymentMethodModel: Model<PaymentMethodDocument>,
  ) {
    const apiKey = process.env.SAFEPAY_API_KEY;
    const host = process.env.SAFEPAY_API_HOST ?? 'https://api.getsafepay.com';
    this.safepayClient = new Safepay(apiKey, { authType: 'secret', host });
  }

  // Create Safepay customer for user
  async createCustomer(dto: CreateCustomerDto) {
    const existing = await this.customerModel.findOne({ user: dto.userId });
    if (existing) return existing;

    const resp = await this.safepayClient.customers.object.create({
      first_name: dto.firstName ?? '',
      last_name: dto.lastName ?? '',
      email: dto.email,
      phone_number: dto.phoneNumber ?? '',
      country: dto.country ?? 'PK',
      is_guest: false,
    });

    const customer = await this.customerModel.create({
      user: new Types.ObjectId(dto.userId),
      customerToken: resp.data.token,
    });

    this.logger.log(`Created Safepay customer for user ${dto.userId}`);
    return customer;
  }

  // Add new payment method for user
  async addPaymentMethod(userId: string, token: string, label?: string, isDefault = false) {
    if (isDefault) {
      await this.paymentMethodModel.updateMany(
        { user: userId },
        { $set: { isDefault: false } },
      );
    }
    const pm = await this.paymentMethodModel.create({
      user: new Types.ObjectId(userId),
      token,
      label,
      isDefault,
    });
    return pm;
  }

  // Delete user payment method
  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    const res = await this.paymentMethodModel.deleteOne({
      _id: paymentMethodId,
      user: userId,
    });
    return { deleted: res.deletedCount > 0 };
  }

  // Charge subscription/invoice using selected method
  async chargeSubscription(dto: ChargeSubscriptionDto) {
    const customer = await this.customerModel.findOne({ user: dto.userId });
    if (!customer) throw new BadRequestException('Customer not found');

    const amountMinor = Math.round(dto.amount * 100);
    const session = await this.safepayClient.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_MERCHANT_API_KEY,
      intent: 'CHARGE',
      mode: 'payment',
      currency: dto.currency,
      amount: amountMinor,
      metadata: {
        userId: dto.userId,
        subscriptionId: dto.subscriptionId,
        paymentMethodId: dto.paymentMethodId,
      },
      customer_token: customer.customerToken,
      payment_method_token: dto.paymentMethodId,
    });

    return {
      tracker: session.tracker,
      redirectUrl: session.tracker.redirect_url,
    };
  }
}
