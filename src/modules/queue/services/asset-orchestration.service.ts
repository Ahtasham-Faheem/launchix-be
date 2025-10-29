import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Brand } from '../../brand/schemas/brand.schema';
import { QueueService } from './queue.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AssetOrchestrationService {
  private readonly logger = new Logger(AssetOrchestrationService.name);

  constructor(
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Orchestrates the complete asset generation pipeline for a brand
   */
  async orchestrateAssetGeneration(brandId: string, priority?: number) {
    const brand = await this.brandModel.findById(brandId);
    if (!brand) {
      throw new Error('Brand not found');
    }

    const brandObjectId = new Types.ObjectId(brandId);

    this.logger.log(`Starting asset orchestration for brand: ${brandId}`);

    // Step 1: Generate color palette
    const colorJob = await this.queueService.addColorGenerationJob(
      brandObjectId,
      brand.brandStyle,
      priority,
    );

    // Wait for color job to complete to get the palette
    const colorResult = await this.waitForJobCompletion(colorJob);
    
    if (!colorResult.success) {
      throw new Error(`Color generation failed: ${colorResult.error}`);
    }

    const palette = colorResult.data.palette;

    // Step 2: Generate all assets in parallel
    const [logoJobs, websiteJob, mockupJob] = await Promise.all([
      this.queueService.addLogoGenerationJobs(
        brandObjectId,
        brand.businessName,
        brand.tagline,
        brand.brandStyle,
        palette,
        priority,
      ),
      this.queueService.addWebsiteGenerationJob(
        brandObjectId,
        brand.businessName,
        brand.tagline,
        brand.industry,
        palette,
        priority,
      ),
      this.queueService.addMockupGenerationJob(brandObjectId, priority),
    ]);

    // Step 3: Wait for all parallel jobs to complete
    const [logoResults, websiteResult, mockupResult] = await Promise.all([
      Promise.all(logoJobs.map((job) => this.waitForJobCompletion(job))),
      this.waitForJobCompletion(websiteJob),
      this.waitForJobCompletion(mockupJob),
    ]);

    // Collect results
    const logos = logoResults
      .filter((r) => r.success)
      .map((r) => r.data.logo);

    if (!websiteResult.success || !mockupResult.success) {
      this.logger.error('Some asset generation jobs failed');
    }

    // Step 4: Aggregate all assets
    const aggregationJob = await this.queueService.addAssetAggregationJob(
      brandObjectId,
      palette,
      logos,
      websiteResult.data?.websiteJson || {},
      mockupResult.data?.mockups || [],
      priority,
    );

    const aggregationResult = await this.waitForJobCompletion(aggregationJob);

    if (!aggregationResult.success) {
      throw new Error('Asset aggregation failed');
    }

    this.logger.log(`Asset orchestration completed for brand: ${brandId}`);

    // Emit event for any listeners
    this.eventEmitter.emit('brand.assets.completed', {
      brandId,
      assets: aggregationResult.data.assets,
    });

    return {
      brandId,
      status: 'completed',
      assets: aggregationResult.data.assets,
    };
  }

  /**
   * Initiates asset generation without waiting for completion
   */
  async initiateAssetGeneration(brandId: string, priority?: number) {
    const brand = await this.brandModel.findById(brandId);
    if (!brand) {
      throw new Error('Brand not found');
    }

    const brandObjectId = new Types.ObjectId(brandId);

    // Start the orchestration process in the background
    this.orchestrateAssetGeneration(brandId, priority).catch((error) => {
      this.logger.error(`Asset orchestration failed for brand ${brandId}:`, error);
      this.eventEmitter.emit('brand.assets.failed', { brandId, error: error.message });
    });

    return {
      brandId,
      status: 'processing',
      message: 'Asset generation initiated. Check status endpoint for progress.',
    };
  }

  /**
   * Wait for a job to complete and return its result
   */
  private async waitForJobCompletion(job: any, maxWaitTime = 300000): Promise<any> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const state = await job.getState();

      if (state === 'completed') {
        return job.returnvalue;
      }

      if (state === 'failed') {
        return {
          success: false,
          error: job.failedReason || 'Job failed',
        };
      }

      // Wait 2 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return {
      success: false,
      error: 'Job timeout',
    };
  }

  /**
   * Get the current status of asset generation for a brand
   */
  async getAssetGenerationStatus(brandId: string) {
    const statuses = await this.queueService.getBrandJobStatuses(brandId);

    const allCompleted = Object.values(statuses).every((s: any) => s.state === 'completed');
    const anyFailed = Object.values(statuses).some((s: any) => s.state === 'failed');

    let overallStatus = 'processing';
    if (allCompleted) {
      overallStatus = 'completed';
    } else if (anyFailed) {
      overallStatus = 'partial_failure';
    }

    return {
      brandId,
      status: overallStatus,
      jobs: statuses,
    };
  }
}