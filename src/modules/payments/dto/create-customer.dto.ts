import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @ApiProperty({ example: 'Hassan' })
  firstName: string;

  @IsString()
  @ApiProperty({ example: 'Zaidi' })
  lastName: string;

  @IsString()
  @ApiProperty({ example: 'hassan@example.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: '+923331234567' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'PK', required: false })
  country?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isGuest?: boolean;

  userId?: string;
}