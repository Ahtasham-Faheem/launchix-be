import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Verification code sent to user\'s email',
    example: '123456',
  })
  @IsNotEmpty()
  code: string;
}