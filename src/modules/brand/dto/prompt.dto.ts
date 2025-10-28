import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ParsePromptDto {
  @ApiProperty({ example: 'Coffee shop named UrbanBrew with cozy vibes' })
  @IsString()
  @MinLength(3)
  prompt!: string;
}
