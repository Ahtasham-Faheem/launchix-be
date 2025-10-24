import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { AIModel } from '../dto/logo-generation-request.dto';
import { LogoResult } from '../dto/logo-generation-response.dto';
import { AIModelProvider, GenerationParams } from '../interfaces/ai-model.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MidjourneyProvider implements AIModelProvider {
    private readonly logger = new Logger(MidjourneyProvider.name);
    private readonly axiosInstance: AxiosInstance;
    private readonly apiKey: string;
    private readonly timeout: number;

    readonly model = AIModel.MIDJOURNEY;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('MIDJOURNEY_API_KEY', '');
        this.timeout = this.configService.get<number>('MIDJOURNEY_TIMEOUT', 60000);

        // Note: Using a hypothetical Midjourney API endpoint
        // In production, you'd use the actual Midjourney API or a proxy service
        this.axiosInstance = axios.create({
            baseURL: this.configService.get<string>('MIDJOURNEY_API_URL', 'https://api.midjourney.com/v1'),
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
            this.logger.log(`Generating logo with Midjourney: ${params.prompt.substring(0, 50)}...`);

            // Submit generation request
            const submitResponse = await this.axiosInstance.post('/imagine', {
                prompt: params.prompt,
            });

            const taskId = submitResponse.data.task_id;

            // Poll for completion
            const imageUrl = await this.pollForCompletion(taskId);

            const generationTime = Date.now() - startTime;

            this.logger.log(`Midjourney generation completed in ${generationTime}ms`);

            return {
                id: `midjourney_${uuidv4()}`,
                imageUrl,
                model: this.model,
                prompt: params.prompt,
                generatedAt: new Date(),
                parameters: {
                    colorScheme: params.style as any,
                    fontFamily: params.style as any,
                    logoStyle: params.style as any,
                },
                qualityScore: 0.92,
                generationTimeMs: generationTime,
            };
        } catch (error) {
            // const generationTime = Date.now() - startTime;
            this.logger.error(`Midjourney generation failed: ${error.message}`, error.stack);

            throw new Error(`Midjourney generation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    private async pollForCompletion(taskId: string, maxAttempts: number = 30): Promise<string> {
        const pollInterval = 2000; // 2 seconds

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await this.axiosInstance.get(`/task/${taskId}`);
                const status = response.data.status;

                if (status === 'completed') {
                    return response.data.image_url;
                } else if (status === 'failed') {
                    throw new Error('Midjourney generation failed');
                }

                // Wait before next poll
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            } catch (error) {
                if (attempt === maxAttempts - 1) {
                    throw error;
                }
            }
        }

        throw new Error('Midjourney generation timeout');
    }

    async isAvailable(): Promise<boolean> {
        if (!this.apiKey) {
            this.logger.warn('Midjourney API key not configured');
            return false;
        }

        try {
            await this.axiosInstance.get('/health', { timeout: 5000 });
            return true;
        } catch (error) {
            this.logger.error(`Midjourney availability check failed: ${error.message}`);
            return false;
        }
    }
}