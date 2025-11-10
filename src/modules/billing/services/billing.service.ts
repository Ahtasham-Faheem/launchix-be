import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Plan, PlanDocument } from '../schemas/plan.schema';
import { Coupon, CouponDocument } from '../schemas/coupon.schema';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CreatePlanDto, UpdatePlanDto } from '../dto/create-plan.dto';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { CancelSubscriptionDto } from '../dto/cancel-subscription.dto';
import { MailService } from 'src/shared/mail/mail.service';
import { SafepayService } from 'src/modules/payments/services/safepay.service';
import { PaymentMethod, PaymentMethodDocument } from 'src/modules/payments/schemas/payment-method.schema';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectModel(Plan.name) private planModel: Model<PlanDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Subscription.name) private subModel: Model<SubscriptionDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(PaymentMethod.name) private paymentMethodModel: Model<PaymentMethodDocument>,
    private readonly emailService: MailService,
    private readonly safepayService: SafepayService,
  ) { }

  // ===================================================
  // ✅ PLAN MANAGEMENT (ADMIN)
  // ===================================================
  createPlan(dto: CreatePlanDto) {
    return this.planModel.create(dto);
  }

  getPlans() {
    return this.planModel.find({}).sort({ amount: 1 }).lean();
  }

  updatePlan(id: string, dto: UpdatePlanDto) {
    return this.planModel.findByIdAndUpdate(id, { $set: dto }, { new: true });
  }

  async deletePlan(id: string) {
    const subCount = await this.subModel.countDocuments({
      plan: id,
      status: { $in: ['trialing', 'active', 'past_due'] },
    });
    if (subCount > 0) {
      throw new BadRequestException('Cannot delete plan with active subscriptions');
    }
    await this.planModel.deleteOne({ _id: id });
    return { success: true };
  }

  // ===================================================
  // ✅ SUBSCRIPTION CREATION (USER)
  // ===================================================
  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const plan = await this.planModel.findById(dto.planId);
    if (!plan || !plan.isActive) throw new NotFoundException('Plan not found');

    const now = new Date();
    const end = new Date(now);
    if (plan.interval === 'year') end.setFullYear(end.getFullYear() + plan.intervalCount);
    else if (plan.interval === 'month') end.setMonth(end.getMonth() + plan.intervalCount);
    else end.setDate(end.getDate() + 30 * plan.intervalCount);

    let coupon: CouponDocument | null = null;
    if (dto.couponCode) {
      coupon = await this.couponModel.findOne({ code: dto.couponCode, isActive: true });
    }

    const sub = await this.subModel.create({
      user: new Types.ObjectId(userId),
      plan: plan._id,
      status: 'active',
      interval: plan.interval,
      intervalCount: plan.intervalCount,
      coupon: coupon?._id ?? null,
      currentPeriodStart: now,
      currentPeriodEnd: end,
    });

    const invoice = await this.generateInvoiceForSubscription(sub, plan, coupon ?? undefined);


    const user = await this.userModel.findById(userId);
    const currency = plan.currency.toUpperCase() === 'PKR' ? 'PKR' : 'USD';

    // if you want auto-charge via Safepay:
    const safepayCustomer = await this.safepayService.createCustomer({
      userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Get default payment method from DB
    const paymentMethod = await this.paymentMethodModel.findOne({
      user: userId,
      isDefault: true,
    });

    if (paymentMethod) {
      await this.safepayService.chargeSubscription({
        userId,
        subscriptionId: sub._id.toString(),
        paymentMethodId: paymentMethod.token,
        amount: plan.amount / 100, // convert from cents to main unit
        currency,
      });
    }

    await this.sendInvoiceEmail(invoice._id.toString());

    return { subscription: sub, invoice };
  }

  // ===================================================
  // ✅ CANCEL SUBSCRIPTION
  // ===================================================
  async cancelSubscription(userId: string, subId: string, dto: CancelSubscriptionDto) {
    const sub = await this.subModel
      .findOne({ _id: subId, user: userId })
      .populate('plan');

    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.status === 'canceled') throw new BadRequestException('Already canceled');

    if (dto.cancelAtPeriodEnd) {
      sub.cancelAtPeriodEnd = true;
      await sub.save();
      this.logger.log(`Subscription ${sub._id} marked for period-end cancel`);
      return { message: 'Subscription will cancel at period end', cancelDate: sub.currentPeriodEnd };
    }

    // Immediate cancellation
    sub.status = 'canceled';
    sub.cancelAtPeriodEnd = false;
    sub.currentPeriodEnd = new Date();
    await sub.save();

    await this.invoiceModel.updateMany(
      { subscription: sub._id, status: { $in: ['open', 'uncollectible'] } },
      { $set: { status: 'canceled' } },
    );

    const user = await this.userModel.findById(sub.user);
    if (user?.email) {
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Subscription Canceled',
        template: 'subscription-canceled',
        variables: {
          planName: (sub.plan as any).name || 'Your Plan',
          periodEnd: sub.currentPeriodEnd.toDateString(),
        },
      });
    }

    this.logger.warn(`Subscription ${sub._id} canceled immediately`);
    return { message: 'Subscription canceled successfully' };
  }

  // ===================================================
  // ✅ GET SUBSCRIPTIONS + INVOICES
  // ===================================================
  async getUserSubscriptions(userId: string) {
    return this.subModel.find({ user: userId }).populate('plan').sort({ createdAt: -1 });
  }

  async getUserInvoices(userId: string) {
    return this.invoiceModel.find({ user: userId }).populate('subscription subscription.plan');
  }

  async getAllSubscriptions() {
    return this.subModel.find().populate('user plan').sort({ createdAt: -1 });
  }

  async getAllInvoices() {
    return this.invoiceModel.find().populate('user subscription plan');
  }

  // ===================================================
  // ✅ INVOICE HELPERS
  // ===================================================
  async generateInvoiceForSubscription(
    sub: SubscriptionDocument,
    plan?: PlanDocument,
    coupon?: CouponDocument,
  ): Promise<InvoiceDocument> {
    const planDoc = plan || (await this.planModel.findById(sub.plan));
    if (!planDoc) throw new NotFoundException('Plan not found');

    let amountDue = planDoc.amount;
    if (coupon) {
      if (coupon.percentOff) amountDue = Math.round(amountDue * (1 - coupon.percentOff / 100));
      else if (coupon.amountOff) amountDue = Math.max(0, amountDue - coupon.amountOff);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    return this.invoiceModel.create({
      user: sub.user,
      subscription: sub._id,
      currency: planDoc.currency,
      amountDue,
      amountPaid: 0,
      amountRemaining: amountDue,
      status: 'open',
      dueDate,
    });
  }

  async markInvoicePaid(invoiceId: string, providerInvoiceId?: string) {
    const invoice = await this.invoiceModel.findById(invoiceId);
    if (!invoice) throw new NotFoundException('Invoice not found');

    invoice.status = 'paid';
    invoice.amountPaid = invoice.amountDue;
    invoice.amountRemaining = 0;
    invoice.paidAt = new Date();
    if (providerInvoiceId) invoice.providerInvoiceId = providerInvoiceId;
    await invoice.save();

    await this.subModel.updateOne({ _id: invoice.subscription }, { $set: { status: 'active' } });
    return invoice;
  }

  async sendInvoiceEmail(invoiceId: string) {
    const invoice = await this.invoiceModel.findById(invoiceId).populate('user subscription');
    if (!invoice) return;

    const user = invoice.user as any as UserDocument;
    await this.emailService.sendInvoiceEmail(user.email, {
      amount: invoice.amountDue,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      invoiceId: invoice._id.toString(),
    });
  }

  async markOverdueInvoices() {
    const now = new Date();
    const invoices = await this.invoiceModel.find({
      status: 'open',
      dueDate: { $lt: now },
    });

    for (const inv of invoices) {
      inv.status = 'uncollectible';
      await inv.save();

      await this.subModel.updateOne(
        { _id: inv.subscription },
        { $set: { status: 'past_due' } },
      );

      const user = await this.userModel.findById(inv.user);
      if (user?.email) {
        await this.emailService.sendOverdueEmail(user.email, {
          amount: inv.amountDue,
          currency: inv.currency,
          invoiceId: inv._id.toString(),
        });
      }
    }
  }

  // ===================================================
  // ✅ BRAND LIMIT
  // ===================================================
  async getBrandLimitForUser(userId: string): Promise<{ maxBrands: number }> {
    const sub = await this.subModel
      .findOne({ user: userId, status: { $in: ['active', 'trialing', 'past_due'] } })
      .populate('plan');
    if (!sub) return { maxBrands: 2 };

    const plan = sub.plan as any as PlanDocument;
    if (!plan || plan.maxBrands === 0) return { maxBrands: Number.MAX_SAFE_INTEGER };
    return { maxBrands: plan.maxBrands };
  }
}
