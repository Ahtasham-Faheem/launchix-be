import { ApiProperty } from '@nestjs/swagger';

export class DeletePaymentMethodDto {
  @ApiProperty({ example: '64f1a1...' })
  userId: string;

  @ApiProperty({ example: 'pm_123456' })
  paymentMethodId: string;
}
