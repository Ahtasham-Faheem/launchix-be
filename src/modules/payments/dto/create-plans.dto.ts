import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray } from 'class-validator';

export class CreatePlansDto {
  @ApiProperty({
    description: 'Standard plan Stripe product ID',
    example: 'prod_TS4G27nfGPdhsT'
  })
  @IsString()
  standardProductId: string;

  @ApiProperty({
    description: 'Standard plan Stripe price ID',
    example: 'price_1SVA7iB5kM6e71ICAlezOh06'
  })
  @IsString()
  standardPriceId: string;

  @ApiProperty({
    description: 'Premium plan Stripe product ID',
    example: 'prod_TS4HUztQnDr8sG'
  })
  @IsString()
  premiumProductId: string;

  @ApiProperty({
    description: 'Premium plan Stripe price ID',
    example: 'price_1SVA8lB5kM6e71ICw99dN6hQ'
  })
  @IsString()
  premiumPriceId: string;

  @ApiProperty({
    description: 'Standard plan features array',
    example: ['Up to 5 Brands', 'AI Website Editor', 'Email support']
  })
  @IsArray()
  standardFeatures: string[];

  @ApiProperty({
    description: 'Premium plan features array',
    example: ['Unlimited Brands', 'Priority Support', 'Client Management']
  })
  @IsArray()
  premiumFeatures: string[];
}