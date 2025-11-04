// src/billing/dto/create-subscription.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Plan ID to subscribe to' })
  @IsMongoId()
  planId: string;

  @ApiProperty({ description: 'Optional coupon code', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
