import { ApiProperty } from '@nestjs/swagger';

export class ChargeSubscriptionDto {
  @ApiProperty({ example: '64f1a1...' })
  userId: string;

  @ApiProperty({ example: 'sub_78910' })
  subscriptionId: string;

  @ApiProperty({ example: 'pm_123456' })
  paymentMethodId: string;

  @ApiProperty({ example: 25 })
  amount: number;

  @ApiProperty({ example: 'USD', description: 'USD or PKR' })
  currency: 'USD' | 'PKR';
}
