import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: '123abc', description: 'Mongo User ID' })
  userId: string;

  @ApiProperty({ example: 'John', required: false })
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  lastName?: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '+923001234567', required: false })
  phoneNumber?: string;

  @ApiProperty({ example: 'PK', required: false })
  country?: string;
}
