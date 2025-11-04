import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { CouponService } from '../services/coupon.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';

@ApiTags('billing-coupons')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('billing/coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new coupon (Admin only)' })
  @ApiResponse({ status: 201, description: 'Coupon created successfully' })
  async create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all coupons (Admin only)' })
  @ApiResponse({ status: 200, description: 'Coupons fetched successfully' })
  async findAll() {
    return this.couponService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon by ID' })
  async findOne(@Param('id') id: string) {
    return this.couponService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a coupon by ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coupon by ID' })
  async delete(@Param('id') id: string) {
    return this.couponService.remove(id);
  }
}
