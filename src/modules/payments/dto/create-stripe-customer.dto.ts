import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateStripeCustomerDto {
  @IsString()
  userId: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}