import { IsString, IsNumber, IsOptional } from 'class-validator';

export class ChargeSubscriptionDto {
  @IsString()
  userId: string;

  @IsString()
  subscriptionId: string;

  @IsString()
  paymentMethodId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;
}