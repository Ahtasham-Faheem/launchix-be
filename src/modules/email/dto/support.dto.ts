import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SupportDto {
  @ApiProperty({
    description: 'Name of the user submitting the support request',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the user for contact',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Support message or issue details',
    example: 'Having trouble connecting my domain to Launchix site.',
  })
  @IsString()
  message: string;
}
