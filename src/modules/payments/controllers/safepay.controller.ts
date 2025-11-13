import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SafepayService } from '../services/safepay.service';
import { AddPaymentMethodDto } from '../dto/add-payment-method.dto';
import { DeletePaymentMethodDto } from '../dto/delete-payment-method.dto';
import { ChargeSubscriptionDto } from '../dto/charge-subscription.dto';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorator/auth.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('payments')
export class SafepayController {
  constructor(private readonly safepay: SafepayService) {}

  @Post('customer')
  @ApiOperation({ summary: 'Create a customer for payments' })
  @ApiResponse({ status: 201 })
  async createCustomer(@CurrentUser() user, @Body() dto: CreateCustomerDto) {
    return this.safepay.createCustomer(user._id, dto);
  }

  @Post('subscription/charge')
  @ApiOperation({ summary: 'Charge a subscription plan' })
  @ApiResponse({ status: 200 })
  async chargeSubscription(
    @CurrentUser() user,
    @Body() dto: ChargeSubscriptionDto,
  ) {
    return this.safepay.chargesPlan({
      ...dto,
      userId: user._id,
    });
  }

  @Get('status/:tracker')
  @ApiOperation({ summary: 'Get payment status by tracker token' })
  @ApiResponse({ status: 200 })
  async getPaymentStatus(@Param('tracker') tracker: string) {
    return this.safepay.getPaymentStatus(tracker);
  }

  @Post('payment-method')
  @ApiOperation({ summary: 'Add a new payment method for the current user' })
  @ApiResponse({ status: 201 })
  async addPaymentMethod(
    @CurrentUser() user,
    @Body() dto: AddPaymentMethodDto,
  ) {
    return this.safepay.addPaymentMethod(
      user._id,
      dto.paymentMethodToken,
      dto.label,
      dto.isDefault,
    );
  }

  @Delete('payment-method')
  @ApiOperation({ summary: 'Delete a payment method for the current user' })
  @ApiResponse({ status: 200 })
  @HttpCode(HttpStatus.OK)
  async deletePaymentMethod(
    @CurrentUser() user,
    @Body() dto: DeletePaymentMethodDto,
  ) {
    return this.safepay.deletePaymentMethod(user._id, dto.paymentMethodId);
  }
}
