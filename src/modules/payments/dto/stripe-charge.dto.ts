import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StripeChargeDto {
  @ApiProperty({ description: 'Subscription ID to charge' })
  @IsString()
  subscriptionId: string;

  @ApiProperty({ description: 'Stripe Payment Method ID' })
  @IsString()
  paymentMethodId: string;
}