import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanDto {
    @ApiProperty({ example: 'starter' })
    @IsString()
    code: string;

    @ApiProperty({ example: 'Starter Plan' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Perfect for getting started' })
    @IsString()
    description: string;

    @ApiProperty({ example: 'usd' })
    @IsString()
    currency: string;

    @ApiProperty({ example: 900 })
    @IsInt()
    @Min(0)
    amount: number;

    @ApiPropertyOptional({
        example: 'month',
        enum: ['month', 'year', 'custom'],
    })
    @IsOptional()
    @IsEnum(['month', 'year', 'custom'])
    interval?: 'month' | 'year' | 'custom' = 'month';

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    intervalCount?: number;

    @ApiPropertyOptional({ example: 2 })
    @IsOptional()
    @IsInt()
    maxBrands?: number;

    @ApiPropertyOptional({ example: ['2 brand identities', 'Logo generation'] })
    @IsOptional()
    features?: string[];

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdatePlanDto extends CreatePlanDto { }
