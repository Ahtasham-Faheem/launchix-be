import { ApiProperty } from '@nestjs/swagger';

export class CancelSubscriptionDto {
  @ApiProperty({
    description: 'Whether to cancel at period end or immediately',
    default: false,
    example: true,
  })
  cancelAtPeriodEnd: boolean;
}
