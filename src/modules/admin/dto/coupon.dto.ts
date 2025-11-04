import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ example: 'LAUNCH10' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  percentOff?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  amountOff?: number;

  @ApiPropertyOptional({
    example: 'once',
    enum: ['once', 'repeating', 'forever'],
  })
  @IsOptional()
  @IsEnum(['once', 'repeating', 'forever'])
  duration?: 'once' | 'repeating' | 'forever' = 'once';

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationInMonths?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2025-12-31T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

export class UpdateCouponDto extends CreateCouponDto {}
