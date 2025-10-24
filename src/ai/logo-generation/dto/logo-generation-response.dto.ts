import { ApiProperty } from '@nestjs/swagger';
import { AIModel, ColorScheme, FontFamily, LogoStyle } from './logo-generation-request.dto';

export enum GenerationStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  PARTIAL = 'partial',
}

export class LogoResult {
  @ApiProperty({
    description: 'Unique identifier for the generated logo',
    example: 'logo_123456',
  })
  id: string;

  @ApiProperty({
    description: 'URL to the generated logo image',
    example: 'https://cdn.example.com/logos/logo_123456.png',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'AI model that generated this logo',
    enum: AIModel,
    example: AIModel.DALL_E,
  })
  model: AIModel;

  @ApiProperty({
    description: 'The prompt used to generate this logo',
    example: 'Modern minimalist logo for TechStart...',
  })
  prompt: string;

  @ApiProperty({
    description: 'Generation timestamp',
    example: '2025-10-24T10:30:00Z',
  })
  generatedAt: Date;

  @ApiProperty({
    description: 'Generation parameters used',
  })
  parameters: {
    colorScheme: ColorScheme;
    fontFamily: FontFamily;
    logoStyle: LogoStyle;
  };

  @ApiProperty({
    description: 'Quality score or confidence (0-1)',
    example: 0.95,
    required: false,
  })
  qualityScore?: number;

  @ApiProperty({
    description: 'Generation time in milliseconds',
    example: 3500,
  })
  generationTimeMs: number;

  @ApiProperty({
    description: 'Additional metadata from the AI model',
    required: false,
  })
  metadata?: {
    apiGenerationTime?: number;
    totalImages?: number;
    allImageUrls?: string[];
    seed?: number;
    modelId?: number;
    variantIndex?: number;
    totalVariants?: number;
    [key: string]: any;
  };
}

export class ModelGenerationResult {
  @ApiProperty({
    description: 'AI model used',
    enum: AIModel,
  })
  model: AIModel;

  @ApiProperty({
    description: 'Status of the generation',
    enum: GenerationStatus,
  })
  status: GenerationStatus;

  @ApiProperty({
    description: 'Primary generated logo (if successful)',
    type: LogoResult,
    required: false,
  })
  result?: LogoResult;

  @ApiProperty({
    description: 'Additional logo variations (if model generated multiple)',
    type: [LogoResult],
    required: false,
  })
  additionalResults?: LogoResult[];

  @ApiProperty({
    description: 'Error message (if failed)',
    required: false,
  })
  error?: string;
}

export class LogoGenerationResponseDto {
  @ApiProperty({
    description: 'Overall generation status',
    enum: GenerationStatus,
  })
  status: GenerationStatus;

  @ApiProperty({
    description: 'Request ID for tracking',
    example: 'req_abc123',
  })
  requestId: string;

  @ApiProperty({
    description: 'Brand name from request',
    example: 'TechStart',
  })
  brandName: string;

  @ApiProperty({
    description: 'Results from each AI model',
    type: [ModelGenerationResult],
  })
  results: ModelGenerationResult[];

  @ApiProperty({
    description: 'Successfully generated logos',
    type: [LogoResult],
  })
  logos: LogoResult[];

  @ApiProperty({
    description: 'Total generation time in milliseconds',
    example: 4200,
  })
  totalTimeMs: number;

  @ApiProperty({
    description: 'Number of successful generations',
    example: 2,
  })
  successCount: number;

  @ApiProperty({
    description: 'Number of failed generations',
    example: 1,
  })
  failureCount: number;

  @ApiProperty({
    description: 'Timestamp of the request',
    example: '2025-10-24T10:30:00Z',
  })
  createdAt: Date;
}