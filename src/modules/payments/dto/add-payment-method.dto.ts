import { ApiProperty } from '@nestjs/swagger';

export class AddPaymentMethodDto {
  @ApiProperty({ example: '64f1a1...', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'pm_123456', description: 'Safepay token' })
  paymentMethodToken: string;

  @ApiProperty({ example: 'Visa ending 4242', required: false })
  label?: string;

  @ApiProperty({ example: true, required: false })
  isDefault?: boolean;
}
