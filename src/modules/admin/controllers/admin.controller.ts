// src/admin/admin.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
} from '@nestjs/swagger';

import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { AdminService } from '../services/admin.service';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateCouponDto, UpdateCouponDto } from '../dto/coupon.dto';
import { CreatePlanDto, UpdatePlanDto } from '../dto/plan.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ---------- USERS ----------

    @Get('users')
    @ApiOperation({
        summary: 'List users (admin)',
        description:
            'Returns paginated list of users with optional search by email/name/username.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Users list retrieved' })
    async listUsers(@Query() query: PaginationQueryDto) {
        return this.adminService.listUsers(query);
    }

    @Get('users/:id')
    @ApiOperation({
        summary: 'Get single user (admin)',
        description:
            'Returns a user along with basic stats (brands, subscriptions, invoices).',
    })
    @ApiResponse({ status: 200, description: 'User retrieved' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUser(@Param('id') id: string) {
        return this.adminService.getUserById(id);
    }


    // ---------- COUPONS ----------
    @Get('coupons')
    @ApiOperation({ summary: 'List all coupons' })
    async listCoupons(@Query() query: PaginationQueryDto) {
        return this.adminService.listCoupons(query);
    }

    @Get('coupons/:id')
    @ApiOperation({ summary: 'Get coupon by ID' })
    async getCoupon(@Param('id') id: string) {
        return this.adminService.getCouponById(id);
    }

    @Post('coupons')
    @ApiOperation({ summary: 'Create a coupon' })
    async createCoupon(@Body() dto: CreateCouponDto) {
        return this.adminService.createCoupon(dto);
    }

    @Patch('coupons/:id')
    @ApiOperation({ summary: 'Update a coupon' })
    async updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
        return this.adminService.updateCoupon(id, dto);
    }

    @Delete('coupons/:id')
    @ApiOperation({ summary: 'Delete a coupon' })
    async deleteCoupon(@Param('id') id: string) {
        return this.adminService.deleteCoupon(id);
    }

    // ---------- PLANS ----------
    @Get('plans')
    @ApiOperation({ summary: 'List all plans' })
    async listPlans(@Query() query: PaginationQueryDto) {
        return this.adminService.listPlans(query);
    }

    @Get('plans/:id')
    @ApiOperation({ summary: 'Get plan by ID' })
    async getPlan(@Param('id') id: string) {
        return this.adminService.getPlanById(id);
    }

    @Post('plans')
    @ApiOperation({ summary: 'Create a plan' })
    async createPlan(@Body() dto: CreatePlanDto) {
        return this.adminService.createPlan(dto);
    }

    @Patch('plans/:id')
    @ApiOperation({ summary: 'Update a plan' })
    async updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
        return this.adminService.updatePlan(id, dto);
    }

    @Delete('plans/:id')
    @ApiOperation({ summary: 'Delete plan (only if no active subscriptions)' })
    async deletePlan(@Param('id') id: string) {
        return this.adminService.deletePlan(id);
    }

    // ---------- SUBSCRIPTIONS ----------
    @Get('subscriptions')
    @ApiOperation({ summary: 'List all subscriptions with invoices' })
    async listSubscriptions(@Query() query: PaginationQueryDto) {
        return this.adminService.listSubscriptions(query);
    }



}
