import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Safepay from '@sfpy/node-core';
import fetch from 'node-fetch';

import {
  SafepayCustomer,
  SafepayCustomerDocument,
} from '../schemas/safepay-customer.schema';
import {
  PaymentMethod,
  PaymentMethodDocument,
} from '../schemas/payment-method.schema';
import { Plan, PlanDocument } from '../../billing/schemas/plan.schema';

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
    @InjectModel(Plan.name)
    private planModel: Model<PlanDocument>,
  ) {
    const apiKey = process.env.SAFEPAY_API_KEY;
    const host = process.env.SAFEPAY_API_HOST ?? 'https://api.getsafepay.com';
    this.safepayClient = new Safepay(apiKey, { authType: 'secret', host });
  }

  // Create Safepay customer for user
  async createCustomer(userId: string, dto: CreateCustomerDto) {
    const existing = await this.customerModel.findOne({ user: userId });
    if (existing) return existing;

    const resp = await this.safepayClient.user.customers.create({
      payload: {
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        phone_number: dto.phoneNumber,
        country: dto.country ?? 'PK',
        is_guest: dto.isGuest ?? false,
      },
    });

    const customer = await this.customerModel.create({
      user: new Types.ObjectId(userId),
      customerToken: resp.data.token,
      merchantApiKey: resp.data.merchant_api_key,
      provider: 'safepay',
    });

    this.logger.log(`Created Safepay customer for user ${userId}`);
    return customer;
  }

  // Add new payment method for user
  async addPaymentMethod(
    userId: string,
    token: string,
    label?: string,
    isDefault = false,
  ) {
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

  // Create checkout session for Express Checkout
  async createCheckoutSession(userId: string, dto: any) {
    const customer = await this.customerModel.findOne({ user: userId });

    // Step 1: Create payment session
    const session = await this.safepayClient.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_PUBLIC_KEY,
      user: customer?.customerToken || dto.customerToken,
      intent: dto.intent,
      mode: 'payment',
      entry_mode: 'raw',
      currency: dto.currency,
      amount: dto.amount,
      // metadata: dto.metadata,
      include_fees: dto.includeFees ?? false,
    });

    // Step 2: Create authentication token
    const authToken = await this.safepayClient.client.passport.create();

    // Step 3: Generate checkout URL
    const checkoutUrl = this.safepayClient.checkouts.createCheckoutUrl({
      tracker: session.data.tracker.token,
      tbt: authToken.data,
      environment: session.data.tracker.environment,
      source: 'hosted',
      user_id: customer?.customerToken || dto.customerToken,
      redirect_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
    });

    return {
      checkoutUrl,
      tracker: session.data.tracker.token,
      environment: session.data.tracker.environment,
    };
  }

  // Get payment status by tracker
  async getPaymentStatus(tracker: string) {
    const response = await this.safepayClient.reporter.payments.fetch(tracker);
    return response.data;
  }

  // Charge subscription/invoice using selected method
  async chargesPlan(dto: ChargeSubscriptionDto) {
    const customer = await this.customerModel.findOne({ user: dto.userId });
    const plan = await this.planModel.findById(dto.planId);

    if (!customer) throw new BadRequestException('Customer not found');
    if (!plan) throw new BadRequestException('Plan not found');

    // Create checkout session for plan payment
    return this.createCheckoutSession(dto.userId, {
      currency: plan.currency.toUpperCase(),
      amount: plan.amount,
      intent: 'CYBERSOURCE',
      customerToken: customer.customerToken,
      metadata: { planId: dto.planId },
      successUrl: `${process.env.FRONTEND_URL}/payment/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
    });
  }
}
