import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../schemas/user.schema';
import { Plan, PlanDocument } from '../../../schemas/plan.schema';
import { EmailService } from '../../email/email.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe;

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Plan.name)
    private planModel: Model<PlanDocument>,
    private emailService: EmailService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });
  }

  async handleStripeWebhook(signature: string, body: Buffer) {
    if (!signature) throw new Error('No signature provided');
    if (!body) throw new Error('No webhook payload was provided');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new Error(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;

        case 'invoice.upcoming':
          await this.handleInvoiceUpcoming(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.overdue':
          await this.handleInvoiceOverdue(event.data.object as Stripe.Invoice);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook event ${event.type}: ${error.message}`);
      // Don't throw - return success to prevent Stripe retries
    }

    return { received: true };
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const subscriptionId = subscription.id;
    const stripePriceId = subscription.items.data[0].price.id;

    this.logger.log(
      `🔄 Subscription updated: ${subscriptionId} for customer: ${customerId}`,
    );

    // Find user by Stripe customer ID or metadata
    let user = await this.userModel.findOne({
      'metadata.stripeCustomerId': customerId,
    });
    
    if (!user) {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted && (customer as Stripe.Customer).metadata?.userId) {
        user = await this.userModel.findById((customer as Stripe.Customer).metadata.userId);
      }
    }

    if (!user) {
      this.logger.error(`User not found for customer: ${customerId}`);
      return;
    }

    // Find plan by Stripe price ID
    const plan = await this.planModel.findOne({ stripePriceId });
    if (!plan) {
      this.logger.error(`Plan not found for price: ${stripePriceId}`);
      return;
    }

    // Update user subscription
    await this.userModel.findByIdAndUpdate(user._id, {
      currentPlan: plan._id,
      stripeSubscriptionId: subscriptionId,
    });

    this.logger.log(`✅ User ${user._id} updated to plan ${plan.name}`);
  }

  private async handleSubscriptionCancelled(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const subscriptionId = subscription.id;

    this.logger.log(
      `❌ Subscription cancelled: ${subscriptionId} for customer: ${customerId}`,
    );

    // Find user by Stripe customer ID or metadata
    let user = await this.userModel.findOne({
      'metadata.stripeCustomerId': customerId,
    });
    
    if (!user) {
      try {
        const customer = await this.stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted && (customer as Stripe.Customer).metadata?.userId) {
          user = await this.userModel.findById((customer as Stripe.Customer).metadata.userId);
        }
      } catch (error) {
        this.logger.error(`Failed to retrieve customer ${customerId}: ${error.message}`);
      }
    }

    if (!user) {
      // Debug: Check if any users exist with Stripe customer IDs
      const allUsersWithStripe = await this.userModel.find({ 'metadata.stripeCustomerId': { $exists: true } }, { 'metadata.stripeCustomerId': 1, email: 1 }).limit(5);
      this.logger.log(`Available Stripe customers in DB: ${JSON.stringify(allUsersWithStripe)}`);
      this.logger.warn(`User not found for customer: ${customerId} - skipping webhook`);
      return;
    }

    // Find free plan
    const freePlan = await this.planModel.findOne({ type: 'free' });
    if (!freePlan) {
      this.logger.error('Free plan not found');
      return;
    }

    // Revert user to free plan
    await this.userModel.findByIdAndUpdate(user._id, {
      currentPlan: freePlan._id,
      stripeSubscriptionId: null,
    });

    this.logger.log(`🔄 User ${user._id} reverted to free plan`);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const amount = invoice.amount_paid / 100;
    const currency = invoice.currency.toUpperCase();
    const invoiceNumber = invoice.number;
    const invoicePdf = invoice.invoice_pdf;

    this.logger.log(
      `💰 Payment succeeded: ${amount} ${currency} for customer: ${customerId}`,
    );

    let user = await this.userModel.findOne({
      'metadata.stripeCustomerId': customerId,
    });

    if (!user) {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (
        customer &&
        !customer.deleted &&
        (customer as Stripe.Customer).metadata?.userId
      ) {
        user = await this.userModel.findById(
          (customer as Stripe.Customer).metadata.userId,
        );
      }
    }

    if (user && user.email) {
      await this.sendPaidInvoiceEmail(user.email, {
        amount,
        currency,
        invoiceNumber,
        invoicePdf,
        customerName:
          invoice.customer_name ||
          `${user.firstName} ${user.lastName}`.trim() ||
          user.username,
        customerEmail: invoice.customer_email || user.email,
      });
    }
  }

  private async handleInvoiceOverdue(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const amount = invoice.amount_due / 100;
    const currency = invoice.currency.toUpperCase();
    const invoiceNumber = invoice.number;
    const dueDate = new Date(invoice.due_date * 1000);

    this.logger.log(
      `⚠️ Invoice overdue: ${amount} ${currency} for customer: ${customerId}`,
    );

    let user = await this.userModel.findOne({
      'metadata.stripeCustomerId': customerId,
    });

    if (!user) {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (
        customer &&
        !customer.deleted &&
        (customer as Stripe.Customer).metadata?.userId
      ) {
        user = await this.userModel.findById(
          (customer as Stripe.Customer).metadata.userId,
        );
      }
    }

    if (user && user.email) {
      await this.sendOverdueInvoiceEmail(user.email, {
        amount,
        currency,
        invoiceNumber,
        dueDate,
        customerName:
          invoice.customer_name ||
          `${user.firstName} ${user.lastName}`.trim() ||
          user.username,
      });
    }
  }

  private async handleInvoiceUpcoming(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const amount = invoice.amount_due / 100;
    const currency = invoice.currency.toUpperCase();
    const dueDate = new Date(invoice.due_date * 1000);
    const invoiceNumber = invoice.number;

    this.logger.log(
      `⏰ Upcoming invoice: ${amount} ${currency} due ${dueDate} for customer: ${customerId}`,
    );

    let user = await this.userModel.findOne({
      'metadata.stripeCustomerId': customerId,
    });

    if (!user) {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (
        customer &&
        !customer.deleted &&
        (customer as Stripe.Customer).metadata?.userId
      ) {
        user = await this.userModel.findById(
          (customer as Stripe.Customer).metadata.userId,
        );
      }
    }

    if (user && user.email) {
      await this.sendUpcomingInvoiceEmail(user.email, {
        amount,
        currency,
        dueDate,
        invoiceNumber,
        customerName:
          invoice.customer_name ||
          `${user.firstName} ${user.lastName}`.trim() ||
          user.username,
      });
    }
  }

  private async sendPaidInvoiceEmail(email: string, data: any) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      <div style="background: #28a745; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Invoice Paid Successfully ✓</h2>
      </div>
      <div style="padding: 30px;">
        <p>Dear ${data.customerName},</p>
        <p>Your invoice <strong>#${data.invoiceNumber}</strong> has been paid successfully.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Amount Paid:</strong> ${data.currency} ${data.amount}</p>
          <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
        </div>
        ${data.invoicePdf ? `<p><a href="${data.invoicePdf}" style="color: #007bff;">Download Invoice PDF</a></p>` : ''}
        <p>Thank you for your business!</p>
      </div>
    </div>`;

    await this.emailService.sendEmailToUser(
      email,
      `Invoice ${data.invoiceNumber} - Payment Confirmed`,
      html,
    );
  }

  private async sendUpcomingInvoiceEmail(email: string, data: any) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      <div style="background: #ffc107; color: #212529; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Upcoming Invoice Reminder ⏰</h2>
      </div>
      <div style="padding: 30px;">
        <p>Dear ${data.customerName},</p>
        <p>Your invoice <strong>#${data.invoiceNumber}</strong> is due soon.</p>
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p><strong>Amount Due:</strong> ${data.currency} ${data.amount}</p>
          <p><strong>Due Date:</strong> ${data.dueDate.toDateString()}</p>
        </div>
        <p>Please ensure your payment method is up to date to avoid service interruption.</p>
      </div>
    </div>`;

    await this.emailService.sendEmailToUser(
      email,
      `Upcoming Invoice ${data.invoiceNumber} - Payment Due Soon`,
      html,
    );
  }

  private async sendOverdueInvoiceEmail(email: string, data: any) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Invoice Overdue ⚠️</h2>
      </div>
      <div style="padding: 30px;">
        <p>Dear ${data.customerName},</p>
        <p>Your invoice <strong>#${data.invoiceNumber}</strong> is now overdue.</p>
        <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p><strong>Amount Due:</strong> ${data.currency} ${data.amount}</p>
          <p><strong>Due Date:</strong> ${data.dueDate.toDateString()}</p>
        </div>
        <p>Please make payment immediately to avoid service suspension.</p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </div>`;

    await this.emailService.sendEmailToUser(
      email,
      `OVERDUE: Invoice ${data.invoiceNumber} - Immediate Payment Required`,
      html,
    );
  }
}
