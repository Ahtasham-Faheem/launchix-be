import { Body, Controller, Get, Param, Post, UseGuards, Req, HttpCode, HttpStatus, Delete, BadRequestException, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { ParsePromptDto } from './dto/prompt.dto';
import { RegenerateFieldsDto } from './dto/regenerate.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { Request } from 'express';
import { AssetOrchestrationService } from '../queue/services/asset-orchestration.service';
import { QueueService } from '../queue/services/queue.service';
import { CurrentUser } from 'src/decorator/auth.decorator';
import { BrandLimitGuard } from 'src/guards/limit-brand.guard';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { RegenerateWebsiteDto } from './dto/regenerate-website.dto';

@ApiTags('brand')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('brand')
export class BrandController {
  constructor(
    private readonly service: BrandService,
    private readonly orchestrationService: AssetOrchestrationService,
    private readonly queueService: QueueService,
  ) { }

  /**
  * ✅ Get all brands for the currently authenticated user
  */
  @Get('my')
  @ApiOperation({
    summary: 'Get Current User Brands',
    description:
      'Fetches all brand records created by the currently authenticated user.',
  })
  async getMyBrands(@CurrentUser() user: any) {
    return this.service.getUserBrands(user._id);
  }

  @Post('parse')
  @UseGuards(BrandLimitGuard)
  @ApiOperation({ summary: 'Parse prompt and create brand' })
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  async parse(@Body() dto: ParsePromptDto, @Req() req: Request, @CurrentUser() user: any) {
    return this.service.createFromPrompt(user, dto.prompt);
  }

  @Post(':id/regenerate')
  @ApiOperation({ summary: 'Regenerate specific brand fields' })
  @ApiResponse({ status: 200, description: 'Fields regenerated successfully' })
  async regenerate(@Param('id') id: string, @Body() dto: RegenerateFieldsDto) {
    return this.service.regenerate(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand with assets' })
  @ApiResponse({ status: 200, description: 'Brand retrieved successfully' })
  async get(@Param('id') id: string) {
    return this.service.getBrand(id);
  }

  // ==================== NEW SEPARATED ENDPOINTS ====================

  @Post(':id/assets/initiate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Initiate complete asset generation (async)',
    description: 'Starts asset generation in background. Returns immediately with job status.'
  })
  @ApiResponse({ status: 202, description: 'Asset generation initiated' })
  async initiateAssetGeneration(@Param('id') id: string) {
    return this.orchestrationService.initiateAssetGeneration(id);
  }


  @Get(':id/assets/status')
  @ApiOperation({ summary: 'Get asset generation status' })
  @ApiResponse({ status: 200, description: 'Status retrieved successfully' })
  async getAssetStatus(@Param('id') id: string) {
    return this.orchestrationService.getAssetGenerationStatus(id);
  }

  @Post(':id/identity/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate identity palette only' })
  @ApiResponse({ status: 202, description: 'Identity generation job queued' })
  async generateColors(@Param('id') id: string) {
    const brand = await this.service.getBrandById(id);
    if (!brand) {
      return { error: 'Brand not found' };
    }

    const job = await this.queueService.addColorGenerationJob(
      brand._id,
      brand.businessName,
      brand.tagline,
      brand.industry,
      brand.brandStyle,
    );

    return {
      jobId: job.id,
      brandId: id,
      status: 'queued',
      message: 'Identity generation job queued',
    };
  }

  @Post(':id/logos/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate all logo variants' })
  @ApiResponse({ status: 202, description: 'Logo generation jobs queued' })
  async generateLogos(@Param('id') id: string, @Body() body: { colors?: string[] }) {
    const brand = await this.service.getBrandById(id);
    if (!brand) {
      return { error: 'Brand not found' };
    }

    // Get colors from body or fetch existing colors
    let colors = body.colors;
    if (!colors) {
      const assets = await this.service.getBrandAssets(id);
      colors = assets?.palette || [];
    }

    const jobs = await this.queueService.addLogoGenerationJobs(
      brand._id,
      brand.businessName,
      brand.tagline,
      brand.brandStyle,
      colors,
      brand.industry,
    );

    return {
      jobIds: jobs.map((j) => j.id),
      brandId: id,
      status: 'queued',
      message: `${jobs.length} logo generation jobs queued`,
    };
  }

  @Post(':id/website/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate website JSON' })
  @ApiResponse({ status: 202, description: 'Website generation job queued' })
  async generateWebsite(@Param('id') id: string, @Body() body: { colors?: string[] }) {
    const brand = await this.service.getBrandById(id);
    if (!brand) {
      return { error: 'Brand not found' };
    }

    const job = await this.queueService.addWebsiteGenerationJob(
      brand._id,
      brand.businessName,
      brand.tagline,
      brand.industry,
      brand.brandStyle,
      brand.typeOfWebsite
    );

    return {
      jobId: job.id,
      brandId: id,
      status: 'queued',
      message: 'Website generation job queued',
    };
  }

  @Post(':id/mockups/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate brand mockups' })
  @ApiResponse({ status: 202, description: 'Mockup generation job queued' })
  async generateMockups(@Param('id') id: string) {
    const brand = await this.service.getBrandById(id);
    if (!brand) {
      return { error: 'Brand not found' };
    }

    const job = await this.queueService.addMockupGenerationJob(brand._id);

    return {
      jobId: job.id,
      brandId: id,
      status: 'queued',
      message: 'Mockup generation job queued',
    };
  }

  @Post(':brandId/regenerate-website')
  async regenerateWebsite(@Param('brandId') brandId: string,  @Body() body: RegenerateWebsiteDto,) {
    const brand = await this.service.getBrandById(brandId);
    if (!brand) {
      return { error: 'Brand not found' };
    }
    const job = await this.queueService.addWebsiteRegenerationJob(brand._id, body.prompt);
    return { message: 'Website regeneration queued', jobId: job.id };
  }

  /**
   * ✅ Update brand details (partial or full)
   * @route PUT /brands/:id
   */

  @Put(':id')
  @ApiOperation({
    summary: 'Update Brand',
  })
  async updateBrand(
    @Param('id') brandId: string,
    @Body() updateData: Partial<UpdateBrandDto>,
  ) {
    if (!brandId) throw new BadRequestException('Brand ID is required');
    return this.service.updateBrand(brandId, updateData);
  }

  /**
   * ✅ Delete Brand & All Related Assets
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete brand and its related assets',
    description:
      'Deletes a brand by ID along with all linked BrandAssets records. Useful for cleanup or brand removal.',
  })
  @ApiResponse({ status: 200, description: 'Brand and assets deleted successfully' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async deleteBrand(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.deleteBrandAndAssets(id, user._id);
  }

  /**
   * ✅ Check Brand Limit
   */
  @Get('limit/check')
  @ApiOperation({
    summary: 'Check brand creation limit',
    description:
      'Checks how many brands the current user has created and how many more they can create (limit = 2).',
  })
  @ApiResponse({
    status: 200,
    description: 'Brand limit status retrieved successfully',
    schema: {
      example: {
        limit: 2,
        used: 1,
        remaining: 1,
        canCreateMore: true,
      },
    },
  })
  async checkBrandLimit(@CurrentUser() user: any) {
    return this.service.checkBrandLimit(user._id, 2);
  }
}