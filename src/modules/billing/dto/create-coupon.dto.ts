import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCouponDto {
  @ApiProperty({ example: 'LAUNCH10' })
  @IsString()
  code: string;

  @ApiProperty({ example: 10, description: 'Percent discount (0–100)', required: false })
  @IsOptional()
  @IsNumber()
  percentOff?: number;

  @ApiProperty({ example: 500, description: 'Flat amount off (in cents)', required: false })
  @IsOptional()
  @IsNumber()
  amountOff?: number;

  @ApiProperty({ example: ['66f3e47dfc13ae4b8b00a2b3'], description: 'IDs of applicable plans', required: false })
  @IsOptional()
  @IsArray()
  applicablePlans?: Types.ObjectId[];

  @ApiProperty({ example: 'repeating', enum: ['once', 'repeating', 'forever'] })
  @IsEnum(['once', 'repeating', 'forever'])
  duration: 'once' | 'repeating' | 'forever';

  @ApiProperty({ example: 3, description: 'Duration in months (if repeating)', required: false })
  @IsOptional()
  @IsNumber()
  durationInMonths?: number | null;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString()
  validUntil?: Date | null;
}
