import {
    Body,
    Controller,
    Get,
    Post,
    HttpCode,
    HttpStatus,
    Logger,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { LogoGenerationRequestDto } from '../dto/logo-generation-request.dto';
import { LogoGenerationResponseDto } from '../dto/logo-generation-response.dto';
import { LogoService } from '../services/logo.service';

@ApiTags('Logo Generation')
@Controller('logos')
@UseInterceptors(ClassSerializerInterceptor)
export class LogoController {
    private readonly logger = new Logger(LogoController.name);

    constructor(private readonly logoService: LogoService) { }

    @Post('generate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Generate AI logos',
        description: 'Generate logos using multiple AI models concurrently with specified design parameters',
    })
    @ApiResponse({
        status: 200,
        description: 'Logos generated successfully',
        type: LogoGenerationResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Invalid request parameters' })
    @ApiInternalServerErrorResponse({ description: 'Logo generation failed' })
    async generateLogos(
        @Body() request: LogoGenerationRequestDto,
    ): Promise<LogoGenerationResponseDto> {
        this.logger.log(`Received logo generation request for: ${request.brandName}`);

        try {
            const result = await this.logoService.generateLogos(request);

            this.logger.log(
                `Logo generation completed: ${result.successCount} successful, ${result.failureCount} failed`
            );

            return result;
        } catch (error) {
            this.logger.error(`Logo generation failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get('stats')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get generation statistics',
        description: 'Get information about available AI models and system status',
    })
    @ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
    })
    async getStats() {
        return this.logoService.getGenerationStats();
    }

    @Get('health')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Health check',
        description: 'Check if the logo generation service is operational',
    })
    @ApiResponse({
        status: 200,
        description: 'Service is healthy',
    })
    async healthCheck() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'logo-generation',
        };
    }
}