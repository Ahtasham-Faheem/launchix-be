// src/billing/dto/create-plan.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'starter' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Starter' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Perfect for getting started' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'usd', default: 'usd' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 900, description: 'Amount in cents' })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: ['month', 'year', 'custom'], default: 'month' })
  @IsEnum(['month', 'year', 'custom'])
  interval: 'month' | 'year' | 'custom';

  @ApiProperty({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  intervalCount: number;

  @ApiProperty({ example: 2, description: 'Max brands for this plan (0 = unlimited)' })
  @IsInt()
  @Min(0)
  maxBrands: number;

  @ApiProperty({ type: [String], example: ['2 brand identities','Logo generation'] })
  @IsString({ each: true })
  features: string[];

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// src/billing/dto/update-plan.dto.ts
import { PartialType } from '@nestjs/swagger';
export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
