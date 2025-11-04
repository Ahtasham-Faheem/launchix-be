import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon } from '../schemas/coupon.schema';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
  ) {}

  async create(dto: CreateCouponDto) {
    const coupon = await this.couponModel.create(dto);
    return { message: 'Coupon created successfully', coupon };
  }

  async findAll() {
    return this.couponModel.find().sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const coupon = await this.couponModel.findById(id).populate('applicablePlans');
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    const updated = await this.couponModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Coupon not found');
    return { message: 'Coupon updated successfully', coupon: updated };
  }

  async remove(id: string) {
    const deleted = await this.couponModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Coupon not found');
    return { message: 'Coupon deleted successfully' };
  }

  /** Optional helper for applying a coupon to a price */
  async applyCoupon(couponCode: string, amount: number): Promise<{ finalAmount: number; discount: number }> {
    const coupon = await this.couponModel.findOne({ code: couponCode, isActive: true });
    if (!coupon) throw new NotFoundException('Invalid or expired coupon');

    let discount = 0;
    if (coupon.percentOff && coupon.percentOff > 0) {
      discount = (amount * coupon.percentOff) / 100;
    } else if (coupon.amountOff && coupon.amountOff > 0) {
      discount = coupon.amountOff;
    }

    const finalAmount = Math.max(0, amount - discount);
    return { finalAmount, discount };
  }
}
