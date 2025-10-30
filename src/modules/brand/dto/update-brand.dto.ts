import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBrandDto {
  @ApiPropertyOptional({ example: 'Inner Peace' })
  businessName?: string;

  @ApiPropertyOptional({ example: 'Wellness & Mindfulness' })
  industry?: string;

  @ApiPropertyOptional({ example: 'Find your calm through mindful living' })
  tagline?: string;

  @ApiPropertyOptional({ example: ['serene', 'minimal', 'pastel'] })
  brandStyle?: string[];

  @ApiPropertyOptional({ example: { businessName: true, tagline: true } })
  aiFlags?: Record<string, boolean>;

  @ApiPropertyOptional({ example: 'inner-peace-839201' })
  subdomain?: string;

  @ApiPropertyOptional({ example: 'https://inner-peace-839201.launchix.ai' })
  publishedUrl?: string;
}
