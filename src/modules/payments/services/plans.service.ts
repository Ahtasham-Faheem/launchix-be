import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from '../../../schemas/plan.schema';
import { User, UserDocument } from '../../../schemas/user.schema';
import { StripeService } from './stripe.service';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan.name)
    private planModel: Model<PlanDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private stripeService: StripeService,
  ) {}

  async createPlan(planData: Partial<Plan>): Promise<Plan> {
    const plan = new this.planModel(planData);
    return plan.save();
  }

  async getAllPlans({ currency = 'usd' }: { currency?: string }) {
    const plans = await this.planModel.find().exec();
    const enrichedPlans = [];

    for (const plan of plans) {
      if (plan.type === 'free') {
        enrichedPlans.push({
          id: plan._id,
          name: 'Starter',
          price: 0,
          currency: currency,
          period: 'Free forever',
          type: plan.type,
          brandCount: plan.brandCount,
          features: plan.features,
          stripeProductId: plan.stripeProductId,
          stripePriceId: plan.stripePriceId,
        });
      } else {
        try {
          const [product, price] = await Promise.all([
            this.stripeService.getProduct(plan.stripeProductId),
            this.stripeService.getPrice(plan.stripePriceId, currency),
          ]);

          enrichedPlans.push({
            id: plan._id,
            name: product.name,
            price: price.amount,
            currency: price?.currency?.toUpperCase(),
            period: price?.interval || 'month',
            type: plan.type,
            brandCount: plan.brandCount,
            features: plan.features,
            stripeProductId: plan.stripeProductId,
            stripePriceId: plan.stripePriceId,
          });
        } catch (error) {
          console.error(
            `Error fetching Stripe data for plan ${plan._id}:`,
            error,
          );
        }
      }
    }

    return enrichedPlans;
  }

  async createDefaultPlans(dto?: any): Promise<any> {
    // Check if plans already exist
    const existingPlans = await this.planModel.find();
    if (existingPlans.length > 0) {
      return { 
        message: 'Plans already exist', 
        count: existingPlans.length,
        plans: existingPlans.map(p => ({ id: p._id, name: p.name, type: p.type }))
      };
    }

    const plans = [
      {
        name: 'Starter',
        stripeProductId: 'prod_starter_local',
        stripePriceId: 'price_starter_local',
        type: 'free',
        brandCount: 1,
        features: [
          'Up to 1 Brands (early access special)',
          'Auto-generated Website',
          'Auto-generated Logo',
          'Vision & Mission Generator',
          'Color Palette Generator',
          'Basic mockups',
          'PNG downloads',
          'Banner generator',
        ],
      },
      {
        name: 'Standard',
        stripeProductId: dto?.standardProductId || 'prod_TS4G27nfGPdhsT',
        stripePriceId: dto?.standardPriceId || 'price_1SVA7iB5kM6e71ICAlezOh06',
        type: 'pro',
        brandCount: 5,
        features: dto?.standardFeatures || [
          'Everything in Starter, plus:',
          'Up to 5 Brands',
          'AI Website Editor',
          'AI Logo Editor',
          'All standalone tools',
          'Unlimited regenerations',
          'Code Export',
          'All file formats (SVG, PNG, PDF)',
          'Email support',
        ],
      },
      {
        name: 'Premium',
        stripeProductId: dto?.premiumProductId || 'prod_TS4HUztQnDr8sG',
        stripePriceId: dto?.premiumPriceId || 'price_1SVA8lB5kM6e71ICw99dN6hQ',
        type: 'pro',
        brandCount: -1,
        features: dto?.premiumFeatures || [
          'Everything in Standard, plus:',
          'Unlimited Brands',
          'Priority Support',
          'Client Management Dashboard',
          'Coming Soon: Marketing Tools, CRM, Social Media Manager, AI Post Generator',
        ],
      },
    ];

    const createdPlans = [];
    for (const planData of plans) {
      const plan = await this.createPlan(planData);
      createdPlans.push(plan);
    }

    return { 
      message: 'Plans created successfully', 
      count: createdPlans.length,
      plans: createdPlans
    };
  }

  async updateUserSubscription(
    userId: string,
    planId: string,
    subscriptionId: string,
  ) {
    console.log(
      '🔄 Updating user subscription - userId:',
      userId,
      'planId:',
      planId,
      'subscriptionId:',
      subscriptionId,
    );

    const plan = await this.planModel.findById(planId);
    if (!plan) throw new Error('Plan not found');

    const updateResult = await this.userModel.findByIdAndUpdate(
      userId,
      {
        currentPlan: planId,
        stripeSubscriptionId: subscriptionId,
      },
      { new: true },
    );

    return { success: true, plan: plan.type, brandLimit: plan.brandCount };
  }

  async subscribeToPlan(planId: string, userId: string) {
    try {
      const plan = await this.planModel.findById(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      if (plan.type === 'free') {
        return { message: 'Free plan activated', planId };
      }

      const user = await this.userModel.findById(userId);

      if (!user?.metadata?.stripeCustomerId) {
        throw new Error(
          `User has no Stripe customer ID. User: ${user ? 'found' : 'not found'}, Metadata: ${JSON.stringify(user?.metadata)}`,
        );
      }

      const subscription = await this.stripeService.createSubscription({
        stripeCustomerId: user.metadata.stripeCustomerId,
        priceId: plan.stripePriceId,
        planId: planId,
        userId,
      });

      return { subscription, planId };
    } catch (error) {
      console.error('subscribeToPlan error:', error.message);
      throw error;
    }
  }

  async verifyPayment(sessionId: string, userId: string) {
    const sessionData: any = await this.stripeService.verifySession(sessionId);

    if (sessionData.paymentStatus === 'paid' && sessionData.subscription) {
      const subscriptionId = sessionData.subscription.id;
      const stripePriceId = sessionData.subscription.items.data[0].price.id;

      const plan = await this.planModel.findOne({ stripePriceId });

      if (plan) {
        const result = await this.updateUserSubscription(
          userId,
          plan._id.toString(),
          subscriptionId,
        );
        console.log('✅ User subscription updated:', result);
      } else {
        console.log('❌ No plan found for stripePriceId:', stripePriceId);
      }
    } else {
      console.log(
        '❌ Payment not paid or no subscription:',
        sessionData.paymentStatus,
      );
    }

    return sessionData;
  }

  async getUserCurrentPlan(userId: string) {
    const user = await this.userModel.findById(userId).populate('currentPlan');
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.currentPlan) {
      return { plan: null, message: 'No active plan' };
    }

    return {
      plan: {
        id: (user.currentPlan as any)._id,
        name: (user.currentPlan as any).name,
        type: (user.currentPlan as any).type,
        brandCount: (user.currentPlan as any).brandCount,
        features: (user.currentPlan as any).features
      },
      subscriptionId: user.stripeSubscriptionId
    };
  }
}
