import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FeedbackDto {
  @ApiProperty({
    description: 'Feedback message from user',
    example: 'Loving the platform! Would like to see dark mode soon.',
  })
  @IsString()
  message: string;
}
