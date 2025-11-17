import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Types } from 'mongoose';
import { QUEUE_NAMES, JOB_NAMES, JOB_PRIORITIES } from '../constants/queue.constants';
import {
  ColorGenerationJobData,
  LogoGenerationJobData,
  WebsiteGenerationJobData,
  MockupGenerationJobData,
  AssetAggregationJobData,
  BannerGenerationJobData,
  LogoVariant,
  BannerVariant,
} from '../interfaces/job-data.interface';
import { Brand } from 'src/schemas/brand.schema';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.IDENTITY_GENERATION) private colorQueue: Queue,
    @InjectQueue(QUEUE_NAMES.LOGO_GENERATION) private logoQueue: Queue,
    @InjectQueue(QUEUE_NAMES.WEBSITE_GENERATION) private websiteQueue: Queue,
    @InjectQueue(QUEUE_NAMES.MOCKUP_GENERATION) private mockupQueue: Queue,
    @InjectQueue(QUEUE_NAMES.ASSET_AGGREGATION) private assetQueue: Queue,
    @InjectQueue(QUEUE_NAMES.BANNER_GENERATION) private bannerQueue: Queue,
  ) { }

  async addColorGenerationJob(
    brandId: Types.ObjectId,
    businessName: string,
    tagline: string,
    industry: string,
    brandStyles: string[],
    priority: number = JOB_PRIORITIES.NORMAL,
  ) {
    const jobData: ColorGenerationJobData = { brandId, businessName, industry, brandStyles, tagline, };

    const job = await this.colorQueue.add(JOB_NAMES.GENERATE_IDENTITY, jobData, {
      jobId: `identity-${brandId}`,
      priority,
    });

    this.logger.log(`Added color generation job: ${job.id} for brand: ${brandId}`);
    return job;
  }

  async addLogoGenerationJobs(
    brandId: Types.ObjectId,
    brandName: string,
    tagline: string | undefined,
    brandStyles: string[],
    colors: string[],
    industry: string,
    priority: number = JOB_PRIORITIES.NORMAL,
  ) {
    const variants: LogoVariant[] = [LogoVariant.PRIMARY, LogoVariant.ICON];
    const jobs = [];

    const bannerVariants: BannerVariant[] = [BannerVariant.TWITTER, BannerVariant.FACEBOOK];

    for (const brannerVariant of bannerVariants) {
      const jobData: BannerGenerationJobData = {
        brandId,
        brandName,
        tagline,
        brandStyles,
        colors,
        variant: brannerVariant,
        industry
      };

      const job = await this.bannerQueue.add(JOB_NAMES.GENERATE_BANNER, jobData, {
        jobId: `banner-${brannerVariant}-${brandId}`,
        priority,
      });

      jobs.push(job);
      this.logger.log(`Added banner generation job: ${job.id} for variant: ${brannerVariant}`);
    }

    for (const variant of variants) {
      const jobData: LogoGenerationJobData = {
        brandId,
        brandName,
        tagline,
        brandStyles,
        colors,
        variant,
        industry
      };

      const job = await this.logoQueue.add(JOB_NAMES.GENERATE_LOGO, jobData, {
        jobId: `logo-${variant}-${brandId}`,
        priority,
      });

      jobs.push(job);
      this.logger.log(`Added logo generation job: ${job.id} for variant: ${variant}`);
    }

    return jobs;
  }

  async addWebsiteGenerationJob(
    brandId: Types.ObjectId,
    businessName: string,
    tagline: string,
    industry: string,
    brandStyle: string[],
    typeOfWebsite: string,
    priority: number = JOB_PRIORITIES.NORMAL,
  ) {
    const jobData: WebsiteGenerationJobData = {
      brandId,
      businessName,
      tagline,
      industry,
      brandStyle,
      typeOfWebsite
    };

    const job = await this.websiteQueue.add(JOB_NAMES.GENERATE_WEBSITE, jobData, {
      jobId: `website-${brandId}`,
      priority,
    });

    this.logger.log(`Added website generation job: ${job.id} for brand: ${brandId}`);
    return job;
  }

  async addMockupGenerationJob(brandId: Types.ObjectId, priority: number = JOB_PRIORITIES.NORMAL) {
    const jobData: MockupGenerationJobData = { brandId };

    const job = await this.mockupQueue.add(JOB_NAMES.GENERATE_MOCKUPS, jobData, {
      jobId: `mockup-${brandId}`,
      priority,
    });

    this.logger.log(`Added mockup generation job: ${job.id} for brand: ${brandId}`);
    return job;
  }

  async addAssetAggregationJob(
    brandId: Types.ObjectId,
    palette: string[],
    logos: { type: string; url: string }[],
    websiteJson: any,
    mockups: string[],
    priority: number = JOB_PRIORITIES.HIGH, // Higher priority for final aggregation
  ) {
    const jobData: AssetAggregationJobData = {
      brandId,
      palette,
      logos,
      websiteJson,
      mockups,
    };

    const job = await this.assetQueue.add(JOB_NAMES.AGGREGATE_ASSETS, jobData, {
      jobId: `aggregate-${brandId}`,
      priority,
    });

    this.logger.log(`Added asset aggregation job: ${job.id} for brand: ${brandId}`);
    return job;
  }

  async getJobStatus(queueName: string, jobId: string) {
    let queue: Queue;

    switch (queueName) {
      case QUEUE_NAMES.IDENTITY_GENERATION:
        queue = this.colorQueue;
        break;
      case QUEUE_NAMES.LOGO_GENERATION:
        queue = this.logoQueue;
        break;
      case QUEUE_NAMES.WEBSITE_GENERATION:
        queue = this.websiteQueue;
        break;
      case QUEUE_NAMES.MOCKUP_GENERATION:
        queue = this.mockupQueue;
        break;
      case QUEUE_NAMES.ASSET_AGGREGATION:
        queue = this.assetQueue;
        break;
      case QUEUE_NAMES.BANNER_GENERATION:
        queue = this.bannerQueue;
        break;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }

    const job = await queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    return {
      id: job.id,
      state,
      progress: job.progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
    };
  }

  async getBrandJobStatuses(brandId: string) {
    const jobIds = [
      `identity-${brandId}`,
      `logo-primary-${brandId}`,
      `logo-secondary-${brandId}`,
      `logo-icon-${brandId}`,
      `logo-text-${brandId}`,
      `website-${brandId}`,
      `mockup-${brandId}`,
      `aggregate-${brandId}`,
      `banner-linkedin-${brandId}`,
      `banner-twitter-${brandId}`,
      `banner-facebook-${brandId}`,
      `banner-instagram-${brandId}`,
    ];

    const statuses = {};

    for (const jobId of jobIds) {
      const queueName = this.getQueueNameFromJobId(jobId);
      if (queueName) {
        const status = await this.getJobStatus(queueName, jobId);
        if (status) {
          statuses[jobId] = status;
        }
      }
    }

    return statuses;
  }

  private getQueueNameFromJobId(jobId: string): string | null {
    if (jobId.startsWith('identity-')) return QUEUE_NAMES.IDENTITY_GENERATION;
    if (jobId.startsWith('logo-')) return QUEUE_NAMES.LOGO_GENERATION;
    if (jobId.startsWith('website-')) return QUEUE_NAMES.WEBSITE_GENERATION;
    if (jobId.startsWith('mockup-')) return QUEUE_NAMES.MOCKUP_GENERATION;
    if (jobId.startsWith('aggregate-')) return QUEUE_NAMES.ASSET_AGGREGATION;
    if (jobId.startsWith('banner-')) return QUEUE_NAMES.BANNER_GENERATION;
    return null;
  }

  async cleanupCompletedJobs(queueName: string, olderThanMs = 86400000) {
    let queue: Queue;

    switch (queueName) {
      case QUEUE_NAMES.IDENTITY_GENERATION:
        queue = this.colorQueue;
        break;
      case QUEUE_NAMES.LOGO_GENERATION:
        queue = this.logoQueue;
        break;
      case QUEUE_NAMES.WEBSITE_GENERATION:
        queue = this.websiteQueue;
        break;
      case QUEUE_NAMES.MOCKUP_GENERATION:
        queue = this.mockupQueue;
        break;
      case QUEUE_NAMES.ASSET_AGGREGATION:
        queue = this.assetQueue;
        break;
      case QUEUE_NAMES.BANNER_GENERATION:
        queue = this.bannerQueue;
        break;
      default:
        return;
    }

    await queue.clean(olderThanMs, 100, 'completed');
    await queue.clean(olderThanMs * 7, 100, 'failed');
    this.logger.log(`Cleaned up old jobs from ${queueName}`);
  }
}