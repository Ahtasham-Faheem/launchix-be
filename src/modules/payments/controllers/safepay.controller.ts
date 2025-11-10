import {
    Controller,
    Post,
    Delete,
    Body,
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
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorator/auth.decorator';

@ApiTags('Safepay')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('safepay')
export class SafepayController {
    constructor(private readonly safepay: SafepayService) { }

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

    @Post('charge')
    @ApiOperation({
        summary: 'Charge a subscription using the selected payment method',
    })
    @ApiResponse({ status: 200 })
    async chargeSubscription(
        @CurrentUser() user,
        @Body() dto: ChargeSubscriptionDto,
    ) {
        return this.safepay.chargeSubscription({
            ...dto,
            userId: user._id,
        });
    }
}
