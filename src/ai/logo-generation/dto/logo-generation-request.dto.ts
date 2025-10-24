import { IsString, IsEnum, IsOptional, IsArray, MinLength, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ColorScheme {
    MONOCHROME = 'monochrome',
    VIBRANT = 'vibrant',
    PASTEL = 'pastel',
    DARK_MODE = 'dark_mode',
    EARTH_TONES = 'earth_tones',
    NEON = 'neon',
    CORPORATE = 'corporate',
}

export enum FontFamily {
    SANS_SERIF = 'sans_serif',
    SERIF = 'serif',
    DISPLAY = 'display',
    SCRIPT = 'script',
    MONOSPACE = 'monospace',
    HANDWRITTEN = 'handwritten',
}

export enum LogoStyle {
    MINIMALIST = 'minimalist',
    MODERN = 'modern',
    VINTAGE = 'vintage',
    ABSTRACT = 'abstract',
    GEOMETRIC = 'geometric',
    ILLUSTRATIVE = 'illustrative',
    MASCOT = 'mascot',
    LETTERMARK = 'lettermark',
    EMBLEM = 'emblem',
}

export enum AIModel {
    DALL_E = 'dall_e',
    MIDJOURNEY = 'midjourney',
    STABLE_DIFFUSION = 'stable_diffusion',
}

export class LogoGenerationRequestDto {
    @ApiProperty({
        description: 'Company or brand name for the logo',
        example: 'TechStart',
    })
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    brandName: string;

    @ApiPropertyOptional({
        description: 'Brief description of the business or brand',
        example: 'AI-powered software solutions',
    })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    businessDescription?: string;

    @ApiProperty({
        description: 'Color scheme for the logo',
        enum: ColorScheme,
        example: ColorScheme.VIBRANT,
    })
    @IsEnum(ColorScheme)
    colorScheme: ColorScheme;

    @ApiProperty({
        description: 'Font family style for text elements',
        enum: FontFamily,
        example: FontFamily.SANS_SERIF,
    })
    @IsEnum(FontFamily)
    fontFamily: FontFamily;

    @ApiProperty({
        description: 'Overall style of the logo',
        enum: LogoStyle,
        example: LogoStyle.MODERN,
    })
    @IsEnum(LogoStyle)
    logoStyle: LogoStyle;

    @ApiPropertyOptional({
        description: 'Specific AI models to use (defaults to all)',
        enum: AIModel,
        isArray: true,
        example: [AIModel.DALL_E, AIModel.STABLE_DIFFUSION],
    })
    @IsArray()
    @IsEnum(AIModel, { each: true })
    @IsOptional()
    models?: AIModel[];

    @ApiPropertyOptional({
        description: 'Additional keywords or themes',
        isArray: true,
        example: ['innovation', 'trust', 'growth'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    keywords?: string[];

    @ApiPropertyOptional({
        description: 'Whether to include the brand name as text in the logo',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    includeText?: boolean = true;
}