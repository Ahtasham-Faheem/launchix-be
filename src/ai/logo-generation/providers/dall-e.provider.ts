import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { AIModel } from '../dto/logo-generation-request.dto';
import { LogoResult } from '../dto/logo-generation-response.dto';
import { AIModelProvider, GenerationParams } from '../interfaces/ai-model.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DallEProvider implements AIModelProvider {
    private readonly logger = new Logger(DallEProvider.name);
    private readonly axiosInstance: AxiosInstance;
    private readonly apiKey: string;
    private readonly timeout: number;

    readonly model = AIModel.DALL_E;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
        this.timeout = this.configService.get<number>('DALL_E_TIMEOUT', 30000);

        this.axiosInstance = axios.create({
            baseURL: 'https://api.openai.com/v1',
            timeout: this.timeout,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
    }

    async generateLogo(params: GenerationParams): Promise<LogoResult> {
        const startTime = Date.now();

        try {
            this.logger.log(`Generating logo with DALL-E: ${params.prompt.substring(0, 50)}...`);

            const response = await this.axiosInstance.post('/images/generations', {
                model: 'dall-e-3',
                prompt: params.prompt,
                n: 1,
                size: '1024x1024',
                quality: 'hd',
                style: 'vivid',
            });

            const generationTime = Date.now() - startTime;
            const imageUrl = response.data.data[0].url;

            this.logger.log(`DALL-E generation completed in ${generationTime}ms`);

            return {
                id: `dalle_${uuidv4()}`,
                imageUrl,
                model: this.model,
                prompt: params.prompt,
                generatedAt: new Date(),
                parameters: {
                    colorScheme: params.style as any,
                    fontFamily: params.style as any,
                    logoStyle: params.style as any,
                },
                qualityScore: 0.9,
                generationTimeMs: generationTime,
            };
        } catch (error) {
            // const generationTime = Date.now() - startTime;
            this.logger.error(`DALL-E generation failed: ${error.message}`, error.stack);

            throw new Error(`DALL-E generation failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    async isAvailable(): Promise<boolean> {
        if (!this.apiKey) {
            this.logger.warn('DALL-E API key not configured');
            return false;
        }

        try {
            await this.axiosInstance.get('/models/dall-e-3', { timeout: 5000 });
            return true;
        } catch (error) {
            this.logger.error(`DALL-E availability check failed: ${error.message}`);
            return false;
        }
    }
}