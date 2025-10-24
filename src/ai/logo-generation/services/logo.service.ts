import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
    AIModel,
    LogoGenerationRequestDto,
} from '../dto/logo-generation-request.dto';
import {
    GenerationStatus,
    LogoGenerationResponseDto,
    LogoResult,
    ModelGenerationResult,
} from '../dto/logo-generation-response.dto';
import { AIModelProvider } from '../interfaces/ai-model.interface';
import { PromptBuilderService } from './prompt-builder.service';
import { DallEProvider } from '../providers/dall-e.provider';
import { MidjourneyProvider } from '../providers/midjourney.provider';
import { StableDiffusionProvider } from '../providers/stable-diffusion.provider';

@Injectable()
export class LogoService {
    private readonly logger = new Logger(LogoService.name);
    private readonly providers: Map<AIModel, AIModelProvider>;
    private readonly defaultTimeout = 60000; // 60 seconds

    constructor(
        private readonly promptBuilder: PromptBuilderService,
        private readonly dallEProvider: DallEProvider,
        private readonly midjourneyProvider: MidjourneyProvider,
        private readonly stableDiffusionProvider: StableDiffusionProvider,
    ) {
        // Initialize provider map
        this.providers = new Map<AIModel, AIModelProvider>([
            [AIModel.DALL_E, this.dallEProvider],
            [AIModel.MIDJOURNEY, this.midjourneyProvider],
            [AIModel.STABLE_DIFFUSION, this.stableDiffusionProvider],
        ]);
    }

    /**
     * Generate logos using multiple AI models concurrently
     */
    async generateLogos(request: LogoGenerationRequestDto): Promise<LogoGenerationResponseDto> {
        const startTime = Date.now();
        const requestId = `req_${uuidv4()}`;

        this.logger.log(`Starting logo generation request ${requestId} for ${request.brandName}`);

        // Determine which models to use
        const modelsToUse = request.models || [
            AIModel.DALL_E,
            AIModel.MIDJOURNEY,
            AIModel.STABLE_DIFFUSION,
        ];

        this.logger.log(`Requested models: ${modelsToUse.join(', ')}`);

        // Check model availability
        const availableModels = await this.checkModelAvailability(modelsToUse);

        if (availableModels.length === 0) {
            throw new Error('No AI models are currently available');
        }

        this.logger.log(`Using models: ${availableModels.join(', ')}`);

        // Generate logos concurrently
        const generationPromises = availableModels.map(model =>
            this.generateWithModel(model, request, requestId)
        );

        // Wait for all generations to complete (or fail)
        const results = await Promise.allSettled(generationPromises);

        // Process results
        const modelResults: ModelGenerationResult[] = [];
        const successfulLogos: LogoResult[] = [];

        results.forEach((result, index) => {
            const model = availableModels[index];

            if (result.status === 'fulfilled') {
                const logos = result.value;

                // Add primary result with additional variants
                modelResults.push({
                    model,
                    status: GenerationStatus.SUCCESS,
                    result: logos[0],
                    additionalResults: logos.length > 1 ? logos.slice(1) : undefined,
                });

                // Add all logos to the successful list
                successfulLogos.push(...logos);

                this.logger.log(
                    `Model ${model} generated ${logos.length} logo${logos.length > 1 ? 's' : ''} successfully`
                );
            } else {
                this.logger.error(`Model ${model} failed: ${result.reason.message}`);
                modelResults.push({
                    model,
                    status: GenerationStatus.FAILED,
                    error: result.reason.message || 'Unknown error',
                });
            }
        });

        const totalTime = Date.now() - startTime;
        const successCount = successfulLogos.length;
        const failedModelsCount = modelResults.filter(r => r.status === GenerationStatus.FAILED).length;
        const successfulModelsCount = modelResults.filter(r => r.status === GenerationStatus.SUCCESS).length;

        // Determine overall status
        let overallStatus: GenerationStatus;
        if (failedModelsCount === 0) {
            overallStatus = GenerationStatus.SUCCESS;
        } else if (successfulModelsCount === 0) {
            overallStatus = GenerationStatus.FAILED;
        } else {
            overallStatus = GenerationStatus.PARTIAL;
        }

        this.logger.log(
            `Logo generation completed: ${successCount} total logos from ${successfulModelsCount} models, ${failedModelsCount} models failed in ${totalTime}ms`
        );

        // Sort logos by quality score
        const sortedLogos = this.sortAndDeduplicateLogos(successfulLogos);

        return {
            status: overallStatus,
            requestId,
            brandName: request.brandName,
            results: modelResults,
            logos: sortedLogos,
            totalTimeMs: totalTime,
            successCount,
            failureCount: failedModelsCount,
            createdAt: new Date(),
        };
    }

    /**
     * Generate logo with a specific model
     * Returns an array of LogoResults (some models may generate multiple images)
     */
    private async generateWithModel(
        model: AIModel,
        request: LogoGenerationRequestDto,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _requestId: string,
    ): Promise<LogoResult[]> {
        const provider = this.providers.get(model);

        if (!provider) {
            throw new Error(`Provider not found for model: ${model}`);
        }

        // Build optimized prompt for this model
        const prompt = this.promptBuilder.buildPrompt(request, model);

        this.logger.debug(`Prompt for ${model}: ${prompt}`);

        // Check if provider supports multiple generations (Stable Diffusion)
        if (model === AIModel.STABLE_DIFFUSION && 'generateMultipleLogos' in provider) {
            this.logger.log(`Generating multiple logos with ${model}`);

            // Generate multiple logos at once
            const logoResults: LogoResult[] = await this.withTimeout(
                (provider as any).generateMultipleLogos(
                    {
                        prompt,
                        model,
                        width: 512,
                        height: 512,
                    },
                    2 // Generate 2 variations
                ),
                this.defaultTimeout,
                `${model} generation timeout`
            );

            // Add request parameters to all results
            logoResults.forEach((logoResult: LogoResult) => {
                logoResult.parameters = {
                    colorScheme: request.colorScheme,
                    fontFamily: request.fontFamily,
                    logoStyle: request.logoStyle,
                };
            });

            return logoResults;
        } else {
            // Single generation for other models
            this.logger.log(`Generating single logo with ${model}`);

            const logoResult = await this.withTimeout(
                provider.generateLogo({
                    prompt,
                    model,
                    width: 1024,
                    height: 1024,
                }),
                this.defaultTimeout,
                `${model} generation timeout`
            );

            // Add request parameters to result
            logoResult.parameters = {
                colorScheme: request.colorScheme,
                fontFamily: request.fontFamily,
                logoStyle: request.logoStyle,
            };

            return [logoResult];
        }
    }

    /**
     * Check which models are available
     */
    private async checkModelAvailability(models: AIModel[]): Promise<AIModel[]> {
        this.logger.log(`Checking availability for models: ${models.join(', ')}`);

        const availabilityChecks = models.map(async (model) => {
            const provider = this.providers.get(model);
            if (!provider) {
                this.logger.warn(`Provider not found for model: ${model}`);
                return { model, available: false };
            }

            try {
                const available = await this.withTimeout(
                    provider.isAvailable(),
                    5000,
                    'Availability check timeout'
                );

                if (available) {
                    this.logger.log(`Model ${model} is available`);
                } else {
                    this.logger.warn(`Model ${model} is not available`);
                }

                return { model, available };
            } catch (error) {
                this.logger.warn(`Model ${model} availability check failed: ${error.message}`);
                return { model, available: false };
            }
        });

        const results = await Promise.all(availabilityChecks);
        const availableModels = results.filter(r => r.available).map(r => r.model);

        this.logger.log(
            `Available models: ${availableModels.length > 0 ? availableModels.join(', ') : 'none'}`
        );

        return availableModels;
    }

    /**
     * Sort logos by quality score and remove duplicates
     */
    private sortAndDeduplicateLogos(logos: LogoResult[]): LogoResult[] {
        // Sort by quality score (descending)
        const sorted = logos.sort((a, b) => {
            const scoreA = a.qualityScore || 0;
            const scoreB = b.qualityScore || 0;
            return scoreB - scoreA;
        });

        // In production, you might want to implement image similarity detection
        // to remove near-duplicate logos based on perceptual hashing or other techniques
        return sorted;
    }

    /**
     * Wrap a promise with a timeout
     */
    private async withTimeout<T>(
        promise: Promise<T>,
        timeoutMs: number,
        timeoutMessage: string,
    ): Promise<T> {
        let timeoutHandle: NodeJS.Timeout;

        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(() => {
                reject(new Error(timeoutMessage));
            }, timeoutMs);
        });

        try {
            const result = await Promise.race([promise, timeoutPromise]);
            clearTimeout(timeoutHandle);
            return result;
        } catch (error) {
            clearTimeout(timeoutHandle);
            throw error;
        }
    }

    /**
     * Get generation statistics
     */
    async getGenerationStats(): Promise<{
        availableModels: AIModel[];
        totalModels: number;
        modelDetails: Array<{
            model: AIModel;
            available: boolean;
            provider: string;
        }>;
    }> {
        const allModels = Array.from(this.providers.keys());
        const availableModels = await this.checkModelAvailability(allModels);

        const modelDetails = allModels.map(model => {
            const provider = this.providers.get(model);
            return {
                model,
                available: availableModels.includes(model),
                provider: provider?.constructor.name || 'Unknown',
            };
        });

        return {
            availableModels,
            totalModels: allModels.length,
            modelDetails,
        };
    }

    /**
     * Generate logos with retry logic for failed models
     */
    async generateLogosWithRetry(
        request: LogoGenerationRequestDto,
        maxRetries: number = 1,
    ): Promise<LogoGenerationResponseDto> {
        let lastResponse: LogoGenerationResponseDto;
        let attempt = 0;

        do {
            attempt++;
            this.logger.log(`Generation attempt ${attempt}/${maxRetries + 1}`);

            lastResponse = await this.generateLogos(request);

            // If all successful, return immediately
            if (lastResponse.status === GenerationStatus.SUCCESS) {
                return lastResponse;
            }

            // If some failed and we have retries left, retry only failed models
            if (attempt <= maxRetries && lastResponse.failureCount > 0) {
                const failedModels = lastResponse.results
                    .filter(r => r.status === GenerationStatus.FAILED)
                    .map(r => r.model);

                if (failedModels.length > 0) {
                    this.logger.log(`Retrying failed models: ${failedModels.join(', ')}`);
                    
                    // Wait a bit before retry
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Update request to only use failed models
                    request.models = failedModels;
                }
            }
        } while (attempt <= maxRetries && lastResponse.failureCount > 0);

        return lastResponse;
    }

    /**
     * Get total logo count from response
     */
    getTotalLogoCount(response: LogoGenerationResponseDto): number {
        return response.logos.length;
    }

    /**
     * Get logos grouped by model
     */
    getLogosByModel(response: LogoGenerationResponseDto): Map<AIModel, LogoResult[]> {
        const logosByModel = new Map<AIModel, LogoResult[]>();

        response.results.forEach(result => {
            if (result.status === GenerationStatus.SUCCESS && result.result) {
                const logos: LogoResult[] = [result.result];
                if (result.additionalResults) {
                    logos.push(...result.additionalResults);
                }
                logosByModel.set(result.model, logos);
            }
        });

        return logosByModel;
    }
}