/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import {
    AIModel,
    ColorScheme,
    FontFamily,
    LogoGenerationRequestDto,
    LogoStyle,
} from '../dto/logo-generation-request.dto';

@Injectable()
export class PromptBuilderService {
    private readonly logger = new Logger(PromptBuilderService.name);

    /**
     * Build optimized prompts for each AI model
     */
    buildPrompt(request: LogoGenerationRequestDto, model: AIModel): string {
        const basePrompt = this.buildBasePrompt(request);

        switch (model) {
            case AIModel.DALL_E:
                return this.buildDallEPrompt(basePrompt, request);
            case AIModel.MIDJOURNEY:
                return this.buildMidjourneyPrompt(basePrompt, request);
            case AIModel.STABLE_DIFFUSION:
                return this.buildStableDiffusionPrompt(basePrompt, request);
            default:
                return basePrompt;
        }
    }

    /**
     * Build base prompt with common elements
     */
    private buildBasePrompt(request: LogoGenerationRequestDto): string {
        const parts: string[] = [];

        // Logo style
        parts.push(this.getStyleDescription(request.logoStyle));

        // Brand name
        if (request.includeText) {
            parts.push(`logo for "${request.brandName}"`);
        } else {
            parts.push(`logo symbol for ${request.brandName}`);
        }

        // Business context
        if (request.businessDescription) {
            parts.push(`(${request.businessDescription})`);
        }

        // Color scheme
        parts.push(this.getColorSchemeDescription(request.colorScheme));

        // Font family
        if (request.includeText) {
            parts.push(this.getFontFamilyDescription(request.fontFamily));
        }

        // Keywords
        if (request.keywords && request.keywords.length > 0) {
            parts.push(`incorporating themes: ${request.keywords.join(', ')}`);
        }

        return parts.join(', ');
    }

    /**
     * DALL-E specific prompt optimization
     */
    private buildDallEPrompt(basePrompt: string, _request: LogoGenerationRequestDto): string {
        // DALL-E works well with clear, descriptive language
        const prefix = 'Professional logo design:';
        const suffix = 'clean background, high quality, vector style, centered composition';

        return `${prefix} ${basePrompt}, ${suffix}`;
    }

    /**
     * Midjourney specific prompt optimization
     */
    private buildMidjourneyPrompt(basePrompt: string, _request: LogoGenerationRequestDto): string {
        // Midjourney responds well to style parameters and quality flags
        const styleParams: string[] = [];

        styleParams.push('--style raw');
        styleParams.push('--quality 2');
        styleParams.push('--ar 1:1');

        const prefix = basePrompt;
        const suffix = 'logo design, vector art, simple, clean, professional, white background';

        return `${prefix}, ${suffix} ${styleParams.join(' ')}`;
    }

    /**
     * Stable Diffusion specific prompt optimization
     */
    private buildStableDiffusionPrompt(basePrompt: string, _request: LogoGenerationRequestDto): string {
        // Stable Diffusion benefits from detailed technical descriptions
        const technicalDetails = [
            'vector logo',
            'professional design',
            'clean lines',
            'balanced composition',
            'white background',
            'high resolution',
            '4k quality',
        ].join(', ');

        const negativePrompt = 'blurry, pixelated, low quality, cluttered, busy, text errors, distorted';

        return `${basePrompt}, ${technicalDetails} | Negative prompt: ${negativePrompt}`;
    }

    /**
     * Get style description
     */
    private getStyleDescription(style: LogoStyle): string {
        const styleMap: Record<LogoStyle, string> = {
            [LogoStyle.MINIMALIST]: 'minimalist and clean',
            [LogoStyle.MODERN]: 'modern and sleek',
            [LogoStyle.VINTAGE]: 'vintage and classic',
            [LogoStyle.ABSTRACT]: 'abstract and artistic',
            [LogoStyle.GEOMETRIC]: 'geometric and structured',
            [LogoStyle.ILLUSTRATIVE]: 'illustrative and detailed',
            [LogoStyle.MASCOT]: 'mascot-based character',
            [LogoStyle.LETTERMARK]: 'lettermark typography-focused',
            [LogoStyle.EMBLEM]: 'emblem badge-style',
        };

        return styleMap[style] || 'professional';
    }

    /**
     * Get color scheme description
     */
    private getColorSchemeDescription(colorScheme: ColorScheme): string {
        const colorMap: Record<ColorScheme, string> = {
            [ColorScheme.MONOCHROME]: 'monochrome black and white palette',
            [ColorScheme.VIBRANT]: 'vibrant and bold colors',
            [ColorScheme.PASTEL]: 'soft pastel colors',
            [ColorScheme.DARK_MODE]: 'dark mode optimized with light elements',
            [ColorScheme.EARTH_TONES]: 'earthy natural tones',
            [ColorScheme.NEON]: 'bright neon colors',
            [ColorScheme.CORPORATE]: 'professional corporate colors (blue, grey)',
        };

        return colorMap[colorScheme] || 'balanced color palette';
    }

    /**
     * Get font family description
     */
    private getFontFamilyDescription(fontFamily: FontFamily): string {
        const fontMap: Record<FontFamily, string> = {
            [FontFamily.SANS_SERIF]: 'modern sans-serif typography',
            [FontFamily.SERIF]: 'elegant serif typography',
            [FontFamily.DISPLAY]: 'bold display font',
            [FontFamily.SCRIPT]: 'flowing script typography',
            [FontFamily.MONOSPACE]: 'technical monospace font',
            [FontFamily.HANDWRITTEN]: 'friendly handwritten style',
        };

        return fontMap[fontFamily] || 'professional typography';
    }

    /**
     * Get color scheme hex values for metadata
     */
    getColorSchemeColors(colorScheme: ColorScheme): string[] {
        const colorSets: Record<ColorScheme, string[]> = {
            [ColorScheme.MONOCHROME]: ['#000000', '#FFFFFF', '#808080'],
            [ColorScheme.VIBRANT]: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
            [ColorScheme.PASTEL]: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA'],
            [ColorScheme.DARK_MODE]: ['#1A1A1A', '#FFFFFF', '#333333', '#00D9FF'],
            [ColorScheme.EARTH_TONES]: ['#8B7355', '#A0826D', '#C9B29C', '#6B5D4F'],
            [ColorScheme.NEON]: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0080'],
            [ColorScheme.CORPORATE]: ['#0066CC', '#003366', '#6699CC', '#999999'],
        };

        return colorSets[colorScheme] || ['#000000', '#FFFFFF'];
    }
}