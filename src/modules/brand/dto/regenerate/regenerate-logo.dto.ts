import { IsOptional, IsEnum, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LogoVariant } from 'src/modules/queue/interfaces/job-data.interface';


export class RegenerateLogosDto {
  @ApiProperty({
    enum: LogoVariant,
    description: 'Logo variant key to regenerate',
    example: LogoVariant.PRIMARY,
    required: false,
  })
  @IsOptional()
  @IsEnum(LogoVariant, { message: `variant must be one of: ${Object.values(LogoVariant).join(', ')}` })
  variant?: LogoVariant = LogoVariant.PRIMARY;
}