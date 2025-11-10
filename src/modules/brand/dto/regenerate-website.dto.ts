import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegenerateWebsiteDto {
  @ApiProperty({
    description: 'Prompt text describing what changes or updates to apply when regenerating the website.',
    example: 'Make the hero section modern with gradient background and change all fonts to Poppins.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Prompt is required.' })
  @MinLength(5, { message: 'Prompt must be at least 5 characters long.' })
  @MaxLength(500, { message: 'Prompt cannot exceed 500 characters.' })
  prompt: string;
}
