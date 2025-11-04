// src/admin/admin.service.ts
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from 'src/schemas/user.schema';
import { Brand, BrandDocument } from 'src/schemas/brand.schema';
import {
    BrandAssets,
    BrandAssetsDocument,
} from 'src/schemas/assets.schema';
import { Invoice, InvoiceDocument } from 'src/modules/billing/schemas/invoice.schema';
import { Plan, PlanDocument } from 'src/modules/billing/schemas/plan.schema';
import { Subscription, SubscriptionDocument } from 'src/modules/billing/schemas/subscription.schema';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { Coupon, CouponDocument } from 'src/modules/billing/schemas/coupon.schema';


@Injectable()
export class AdminService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
        @InjectModel(BrandAssets.name)
        private assetsModel: Model<BrandAssetsDocument>,
        @InjectModel(Subscription.name)
        private subModel: Model<SubscriptionDocument>,
        @InjectModel(Invoice.name)
        private invoiceModel: Model<InvoiceDocument>,
        @InjectModel(Plan.name)
        private planModel: Model<PlanDocument>,
        @InjectModel(Coupon.name)
        private couponModel: Model<CouponDocument>,
    ) { }

    // ---------- USERS ----------

    async listUsers(query: PaginationQueryDto) {
        const { page = 1, limit = 20, search } = query;
        const skip = (page - 1) * limit;

        // const filter: any = { isDeleted: false };
        const filter: any = {};

        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { email: regex },
                { firstName: regex },
                { lastName: regex },
                { username: regex },
            ];
        }

        const [items, total] = await Promise.all([
            this.userModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.userModel.countDocuments(filter),
        ]);

        return {
            data: items,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }


    async getUserById(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('Invalid user ID');
        }

        const user = await this.userModel.findById(id).lean();
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const [brands, subscriptions, invoices] = await Promise.all([
            // ✅ Get all brands owned by the user + populate BrandAssets
            this.brandModel
                .find({ owner: user._id })
                .populate({
                    path: 'owner',
                    select: 'firstName lastName email',
                })
                .lean()
            ,

            // ✅ Subscriptions with Plan details
            this.subModel
                .find({ user: user._id })
                .populate('plan')
                .lean(),

            // ✅ Latest 10 invoices with Subscription + Plan details
            this.invoiceModel
                .find({ user: user._id })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate({
                    path: 'subscription',
                    populate: { path: 'plan' },
                })
                .lean(),
        ]);

        const brandCount = brands.length;

        return {
            user,
            stats: {
                brandCount,
                subscriptionCount: subscriptions.length,
                activeSubscriptions: subscriptions.filter(
                    (s) => s.status === 'active' || s.status === 'trialing',
                ).length,
            },
            brands,
            subscriptions,
            recentInvoices: invoices,
        };
    }

    // ---------- COUPONS ----------
    async listCoupons(query: PaginationQueryDto) {
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.couponModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.couponModel.countDocuments(),
        ]);

        return {
            data: items,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getCouponById(id: string) {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid coupon ID');
        const coupon = await this.couponModel.findById(id).lean();
        if (!coupon) throw new NotFoundException('Coupon not found');
        return coupon;
    }

    async createCoupon(dto: any) {
        return this.couponModel.create(dto);
    }

    async updateCoupon(id: string, dto: any) {
        const coupon = await this.couponModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!coupon) throw new NotFoundException('Coupon not found');
        return coupon;
    }

    async deleteCoupon(id: string) {
        const coupon = await this.couponModel.findByIdAndDelete(id).lean();
        if (!coupon) throw new NotFoundException('Coupon not found');
        return { message: 'Coupon deleted successfully' };
    }

    // ---------- PLANS ----------
    async listPlans(query: PaginationQueryDto) {
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.planModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.planModel.countDocuments(),
        ]);

        return {
            data: items,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async getPlanById(id: string) {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid plan ID');
        const plan = await this.planModel.findById(id).lean();
        if (!plan) throw new NotFoundException('Plan not found');
        return plan;
    }

    async createPlan(dto: any) {
        return this.planModel.create(dto);
    }

    async updatePlan(id: string, dto: any) {
        const plan = await this.planModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!plan) throw new NotFoundException('Plan not found');
        return plan;
    }

    async deletePlan(id: string) {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid plan ID');

        const activeSubs = await this.subModel.countDocuments({
            plan: id,
            status: { $in: ['active', 'trialing'] },
        });

        if (activeSubs > 0) {
            throw new Error('Cannot delete plan with active subscriptions');
        }

        const plan = await this.planModel.findByIdAndDelete(id).lean();
        if (!plan) throw new NotFoundException('Plan not found');
        return { message: 'Plan deleted successfully' };
    }

    // ---------- SUBSCRIPTIONS ----------
    async listSubscriptions(query: PaginationQueryDto) {
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.subModel
                .find()
                .populate('user', 'firstName lastName email')
                .populate('plan')
                .skip(skip)
                .limit(limit)
                .lean(),
            this.subModel.countDocuments(),
        ]);

        // Populate invoices for each subscription
        const subscriptionIds = items.map((s) => s._id);
        const invoices = await this.invoiceModel
            .find({ subscription: { $in: subscriptionIds } })
            .populate('subscription')
            .lean();

        return {
            data: items.map((sub) => ({
                ...sub,
                invoices: invoices.filter((inv) => inv.subscription?._id.equals(sub._id)),
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }



}
