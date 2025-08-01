import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  planeName: string;

  @IsNumber()
  maxInvoice: number;

  @IsNumber()
  maxClient: number;

  @IsNumber()
  price: number;
}
