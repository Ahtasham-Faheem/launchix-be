import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class RegenerateFieldsDto {
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() businessName?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() industry?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() tagline?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() brandStyle?: boolean;
}
