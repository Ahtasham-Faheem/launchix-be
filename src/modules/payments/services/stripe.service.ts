import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { StripeCustomer, StripeCustomerDocument } from '../schemas/stripe-customer.schema';
import { CreateStripeCustomerDto } from '../dto/create-stripe-customer.dto';
import { Plan, PlanDocument } from '../../billing/schemas/plan.schema';
import { Subscription, SubscriptionDocument } from '../../billing/schemas/subscription.schema';
import { Coupon, CouponDocument } from '../../billing/schemas/coupon.schema';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    @InjectModel(StripeCustomer.name)
    private customerModel: Model<StripeCustomerDocument>,
    @InjectModel(Plan.name)
    private planModel: Model<PlanDocument>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Coupon.name)
    private couponModel: Model<CouponDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });
  }

  // Create Stripe customer for user
  async createCustomer(dto: CreateStripeCustomerDto) {
    const existing = await this.customerModel.findOne({ user: dto.userId });
    if (existing) return existing;

    const stripeCustomer = await this.stripe.customers.create({
      email: dto.email,
      name: dto.firstName && dto.lastName ? `${dto.firstName} ${dto.lastName}` : undefined,
      phone: dto.phone,
      metadata: {
        userId: dto.userId,
      },
    });

    const customer = await this.customerModel.create({
      user: new Types.ObjectId(dto.userId),
      stripeCustomerId: stripeCustomer.id,
      email: dto.email,
      metadata: {
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    this.logger.log(`Created Stripe customer ${stripeCustomer.id} for user ${dto.userId}`);
    return customer;
  }

  // Get customer by user ID
  async getCustomerByUserId(userId: string) {
    return this.customerModel.findOne({ user: userId });
  }



  // Get customer payment methods
  async getPaymentMethods(customerId: string) {
    return this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
  }

  // Attach payment method to customer
  async attachPaymentMethod(paymentMethodId: string, customerId: string) {
    return this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  // Detach payment method from customer
  async detachPaymentMethod(paymentMethodId: string) {
    return this.stripe.paymentMethods.detach(paymentMethodId);
  }

  // Charge subscription with payment method
  async chargeSubscription(subscriptionId: string, paymentMethodId: string, customerId: string) {
    const subscription = await this.subscriptionModel.findById(subscriptionId).populate('plan coupon');
    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    const plan = subscription.plan as any as PlanDocument;
    const coupon = subscription.coupon as any as CouponDocument;
    
    // Calculate final amount with coupon discount
    let finalAmount = plan.amount; // Already in cents
    
    if (coupon && coupon.isActive) {
      if (coupon.percentOff && coupon.percentOff > 0) {
        finalAmount = Math.round(finalAmount * (1 - coupon.percentOff / 100));
      } else if (coupon.amountOff && coupon.amountOff > 0) {
        finalAmount = Math.max(0, finalAmount - coupon.amountOff);
      }
    }
    
    // Ensure minimum amount (Stripe requires at least 50 cents for USD)
    const minAmount = this.getMinimumAmount(plan.currency);
    finalAmount = Math.max(finalAmount, minAmount);
    
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: finalAmount,
        currency: plan.currency.toLowerCase(),
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        metadata: {
          subscriptionId: subscriptionId,
          planId: plan._id.toString(),
          originalAmount: plan.amount.toString(),
          discountAmount: (plan.amount - finalAmount).toString(),
          couponCode: coupon?.code || '',
        },
      });

      // Return success/failure based on payment status
      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
        amount: finalAmount,
        currency: plan.currency,
        error: null
      };
    } catch (error: any) {
      this.logger.error(`Payment failed for subscription ${subscriptionId}: ${error.message}`);
      
      return {
        success: false,
        status: 'failed',
        paymentIntentId: null,
        amount: finalAmount,
        currency: plan.currency,
        error: error.message || 'Payment processing failed'
      };
    }
  }

  // Get minimum amount based on currency (Stripe requirements)
  private getMinimumAmount(currency: string): number {
    const curr = currency.toLowerCase();
    switch (curr) {
      case 'usd':
      case 'eur':
      case 'gbp':
      case 'cad':
      case 'aud':
        return 50; // 50 cents
      case 'jpy':
        return 50; // 50 yen (no decimals)
      case 'pkr':
        return 100; // 1 PKR
      default:
        return 50;
    }
  }
}