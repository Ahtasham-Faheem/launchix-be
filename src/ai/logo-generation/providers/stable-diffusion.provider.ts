import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { AIModel } from '../dto/logo-generation-request.dto';
import { LogoResult } from '../dto/logo-generation-response.dto';
import { AIModelProvider, GenerationParams } from '../interfaces/ai-model.interface';
import { v4 as uuidv4 } from 'uuid';

interface ModelsLabMeta {
  base64: string;
  enhance_prompt: string;
  enhance_style: string | null;
  file_prefix: string;
  guidance_scale: number;
  height: number;
  id: string;
  instant_response: string;
  n_samples: number;
  negative_prompt: string;
  opacity: number;
  outdir: string;
  padding_down: number;
  padding_right: number;
  pag_scale: number;
  prompt: string;
  rescale: string;
  safety_checker: string;
  safety_checker_type: string;
  scale_down: number;
  seed: number;
  temp: string;
  track_id: string | null;
  watermark: string;
  webhook: string | null;
  width: number;
}

interface ModelsLabResponse {
  status: string;
  generationTime: number;
  id: number;
  output: string[];
  proxy_links: string[];
  meta: ModelsLabMeta;
  nsfw_content_detected?: boolean;
}

@Injectable()
export class StableDiffusionProvider implements AIModelProvider {
  private readonly logger = new Logger(StableDiffusionProvider.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly samplesCount: number;

  readonly model = AIModel.STABLE_DIFFUSION;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MODELSLAB_API_KEY', '');
    this.timeout = this.configService.get<number>('STABLE_DIFFUSION_TIMEOUT', 45000);
    this.samplesCount = this.configService.get<number>('STABLE_DIFFUSION_SAMPLES', 2);

    console.log('StableDiffusionProvider API Key:', this.apiKey);

    this.axiosInstance = axios.create({
      baseURL: 'https://modelslab.com/api/v6',
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generateLogo(params: GenerationParams): Promise<LogoResult> {
    const startTime = Date.now();

    try {
      this.logger.log(`Generating logo with Stable Diffusion (ModelsLab): ${params.prompt.substring(0, 50)}...`);

      // Split prompt and negative prompt if present
      const promptParts = params.prompt.split('|').map(p => p.trim());
      const positivePrompt = promptParts[0].replace('Negative prompt:', '').trim();
      const negativePrompt = promptParts[1]?.replace('Negative prompt:', '').trim() || 
        'low quality, blurry, pixelated, cluttered, busy, text errors, distorted';

      const requestBody = {
        key: this.apiKey,
        prompt: positivePrompt,
        negative_prompt: negativePrompt,
        width: params.width || 512,
        height: params.height || 512,
        samples: this.samplesCount, // Generate multiple images
        safety_checker: false,
        enhance_prompt: false,
        guidance_scale: 7.5,
        seed: null, // Random seed for variety
      };

      this.logger.debug(`Request body: ${JSON.stringify(requestBody, null, 2)}`);

      const response = await this.axiosInstance.post<ModelsLabResponse>(
        '/realtime/text2img',
        requestBody
      );

      const generationTime = Date.now() - startTime;

      if (response.data.status !== 'success') {
        throw new Error(`Generation failed with status: ${response.data.status}`);
      }

      // Get all image URLs from the response
      const imageUrls = response.data.proxy_links || response.data.output;

      if (!imageUrls || imageUrls.length === 0) {
        throw new Error('No image URLs in response');
      }

      this.logger.log(
        `Stable Diffusion generated ${imageUrls.length} images in ${generationTime}ms (API: ${response.data.generationTime}s)`
      );

      // Return the first image as the primary result
      // The service will handle multiple results if needed
      return {
        id: `sd_${uuidv4()}`,
        imageUrl: imageUrls[0],
        model: this.model,
        prompt: params.prompt,
        generatedAt: new Date(),
        parameters: {
          colorScheme: params.style as any,
          fontFamily: params.style as any,
          logoStyle: params.style as any,
        },
        qualityScore: 0.88,
        generationTimeMs: generationTime,
        metadata: {
          apiGenerationTime: response.data.generationTime,
          totalImages: imageUrls.length,
          allImageUrls: imageUrls,
          seed: response.data.meta.seed,
          modelId: response.data.id,
        },
      };
    } catch (error) {
      this.logger.error(`Stable Diffusion generation failed: ${error.message}`, error.stack);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Stable Diffusion authentication failed: Invalid API key');
      }
      
      if (error.response?.data) {
        this.logger.error(`API Error Response: ${JSON.stringify(error.response.data)}`);
      }
      
      throw new Error(`Stable Diffusion generation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Generate multiple logo variations in a single request
   */
  async generateMultipleLogos(params: GenerationParams, count: number = 2): Promise<LogoResult[]> {
    const startTime = Date.now();

    try {
      this.logger.log(`Generating ${count} logos with Stable Diffusion (ModelsLab)`);

      const promptParts = params.prompt.split('|').map(p => p.trim());
      const positivePrompt = promptParts[0].replace('Negative prompt:', '').trim();
      const negativePrompt = promptParts[1]?.replace('Negative prompt:', '').trim() || 
        'low quality, blurry, pixelated, cluttered, busy, text errors, distorted';

      const requestBody = {
        key: this.apiKey,
        prompt: positivePrompt,
        negative_prompt: negativePrompt,
        width: params.width || 512,
        height: params.height || 512,
        samples: Math.min(count, 4), // Max 4 samples per request
        safety_checker: false,
        enhance_prompt: false,
        guidance_scale: 7.5,
        seed: null,
      };

      const response = await this.axiosInstance.post<ModelsLabResponse>(
        '/realtime/text2img',
        requestBody
      );

      const generationTime = Date.now() - startTime;

      if (response.data.status !== 'success') {
        throw new Error(`Generation failed with status: ${response.data.status}`);
      }

      const imageUrls = response.data.proxy_links || response.data.output;

      if (!imageUrls || imageUrls.length === 0) {
        throw new Error('No image URLs in response');
      }

      this.logger.log(
        `Generated ${imageUrls.length} logos in ${generationTime}ms (API: ${response.data.generationTime}s)`
      );

      // Create a LogoResult for each generated image
      return imageUrls.map((imageUrl, index) => ({
        id: `sd_${uuidv4()}`,
        imageUrl,
        model: this.model,
        prompt: params.prompt,
        generatedAt: new Date(),
        parameters: {
          colorScheme: params.style as any,
          fontFamily: params.style as any,
          logoStyle: params.style as any,
        },
        qualityScore: 0.88 - (index * 0.01), // Slightly decrease score for variants
        generationTimeMs: generationTime,
        metadata: {
          apiGenerationTime: response.data.generationTime,
          seed: response.data.meta.seed,
          modelId: response.data.id,
          variantIndex: index,
          totalVariants: imageUrls.length,
        },
      }));
    } catch (error) {
      this.logger.error(`Stable Diffusion multiple generation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey || this.apiKey === '') {
      this.logger.warn('ModelsLab API key not configured');
      return false;
    }

    // Simply return true if API key is configured
    // The actual validation will happen during generation
    this.logger.log('ModelsLab API key is configured');
    return true;
  }
}