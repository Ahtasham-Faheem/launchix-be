import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BannerVariant } from 'src/modules/queue/interfaces/job-data.interface';


export class RegenerateBannerDto {
  @ApiProperty({
    enum: BannerVariant,
    default: BannerVariant.LINKEDIN,
    description: 'Type of banner to regenerate',
    example: 'linkedin',
  })
  @IsOptional()
  @IsEnum(BannerVariant, {
    message: `type must be one of: ${Object.values(BannerVariant).join(', ')}`,
  })
  type?: BannerVariant = BannerVariant.LINKEDIN;
}