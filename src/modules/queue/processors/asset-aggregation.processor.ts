import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../constants/queue.constants';
import { AssetAggregationJobData, JobResult } from '../interfaces/job-data.interface';
import { BrandAssets } from '../../brand/schemas/assets.schema';

@Processor(QUEUE_NAMES.ASSET_AGGREGATION, {
  concurrency: 10,
})
export class AssetAggregationProcessor extends WorkerHost {
  private readonly logger = new Logger(AssetAggregationProcessor.name);

  constructor(
    @InjectModel(BrandAssets.name) private assetsModel: Model<BrandAssets>,
  ) {
    super();
  }

  async process(job: Job<AssetAggregationJobData>): Promise<JobResult> {
    const { brandId, palette, logos, websiteJson, mockups } = job.data;

    this.logger.log(`Aggregating assets for brand: ${brandId}`);

    try {
      const assets = await this.assetsModel.findOneAndUpdate(
        { brand: new Types.ObjectId(brandId.toString()) },
        {
          $set: {
            palette,
            logos,
            websiteJson,
            mockups,
          },
        },
        { new: true, upsert: true },
      );

      this.logger.log(`Successfully aggregated assets for brand: ${brandId}`);

      return {
        success: true,
        data: { assets },
        brandId,
      };
    } catch (error) {
      this.logger.error(`Asset aggregation failed for brand ${brandId}:`, error.message);
      throw error;
    }
  }
}