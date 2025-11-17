import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { REGENERATE_JOB_NAMES, REGENERATE_QUEUE_NAMES, RegenerateJobType } from '../constants/regenerate-queue.constants';
import { Types } from 'mongoose';
import { JOB_PRIORITIES } from '../constants/queue.constants';
import { BannerGenerationJobData, BannerVariant, ColorGenerationJobData, LogoRegenerationJobData, LogoVariant } from '../interfaces/job-data.interface';
import { Brand } from 'src/schemas/brand.schema';

@Injectable()
export class RegenerateQueueService {
  private readonly logger = new Logger(RegenerateQueueService.name);

  constructor(
    @InjectQueue(REGENERATE_QUEUE_NAMES.WEBSITE_REGENERATE) private readonly websiteRegenerateQueue: Queue,
    @InjectQueue(REGENERATE_QUEUE_NAMES.LOGO_REGENERATE) private readonly logoRegenerateQueue: Queue,
    @InjectQueue(REGENERATE_QUEUE_NAMES.TYPOGRAPHY_REGENERATE) private readonly typographyRegenerateQueue: Queue,
    @InjectQueue(REGENERATE_QUEUE_NAMES.COLOR_PALETTE_REGENERATE) private readonly colorRegenerateQueue: Queue,
    @InjectQueue(REGENERATE_QUEUE_NAMES.BANNER_REGENERATE) private readonly bannerRegenerateQueue: Queue,
    @InjectQueue(REGENERATE_QUEUE_NAMES.MISSION_REGENERATE) private readonly missionRegenerateQueue: Queue,
    @InjectQueue(REGENERATE_QUEUE_NAMES.VISION_REGENERATE) private readonly visionRegenerateQueue: Queue,
  ) { }


  async regenerateColorPallete(
    brandId: Types.ObjectId,
    businessName: string,
    tagline: string,
    industry: string,
    brandStyles: string[],
    typeOfWebsite: string,
    priority: number = JOB_PRIORITIES.NORMAL,
  ) {
    const jobData: ColorGenerationJobData = { brandId, businessName, industry, brandStyles, tagline, typeOfWebsite };
    const jobId = `${RegenerateJobType.COLOR_PALETTE_REGENERATE}-${brandId}`;

    const existingJob = await this.colorRegenerateQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove(); // remove old one
    }

    const job = await this.colorRegenerateQueue.add(
      REGENERATE_JOB_NAMES.COLOR_PALETTE_REGENERATE,
      jobData, {
      jobId,
      priority,
    });

    this.logger.log(`Added color generation job: ${job.id} for brand: ${brandId}`);
    return job;
  }

  // Added regeneration methods required by controller
  async regenerateWebsite(
    brandId: Types.ObjectId,
    brand: Brand,
    priority: number = JOB_PRIORITIES.NORMAL,
  ) {
    const jobData: any = { brandId, brand };
    const jobId = `${RegenerateJobType.WEBSITE_REGENERATE}-${brandId}`;

    const existingJob = await this.websiteRegenerateQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove(); // remove old one
    }

    const job = await this.websiteRegenerateQueue.add(
      REGENERATE_JOB_NAMES.WEBSITE_REGENERATE,
      jobData,
      {
        jobId,
        priority,
      },
    );

    this.logger.log(`Added website regeneration job: ${job.id} for brand: ${brandId}`);
    return job;
  }

  async regenerateLogos(
    brandId: Types.ObjectId,
    variant: LogoVariant,
    brand?: Brand,
    priority: number = JOB_PRIORITIES.NORMAL,
  ) {
    const jobs = [];

    const pushJob = async (name: string, jobData: LogoRegenerationJobData, jobIdPrefix: string) => {
      const jobId = `${jobIdPrefix}-${brandId}`;
      const existingJob = await this.logoRegenerateQueue.getJob(jobId);
      if (existingJob) {
        await existingJob.remove();
      }

      const j = await this.logoRegenerateQueue.add(name, jobData, {
        jobId,
        priority,
      });
      this.logger.log(`Added logo regeneration job: ${j.id} (${jobIdPrefix}) for brand: ${brandId}`);
      jobs.push(j);
    };

    if (!variant) {
      // queue both primary and icon if variant not specified
      await pushJob(
        REGENERATE_JOB_NAMES.LOGO_REGENERATE,
        { brandId, variant: LogoVariant.PRIMARY, brand },
        RegenerateJobType.LOGO_PRIMARY_REGENERATE
      );
      await pushJob(
        REGENERATE_JOB_NAMES.LOGO_REGENERATE,
        { brandId, variant: LogoVariant.ICON, brand },
        RegenerateJobType.LOGO_ICON_REGENERATE
      );
    } else if (variant === LogoVariant.PRIMARY) {
      await pushJob(
        REGENERATE_JOB_NAMES.LOGO_REGENERATE,
        { brandId, variant, brand },
        RegenerateJobType.LOGO_PRIMARY_REGENERATE
      );
    } else {
      await pushJob(
        REGENERATE_JOB_NAMES.LOGO_REGENERATE,
        { brandId, variant, brand },
        RegenerateJobType.LOGO_ICON_REGENERATE
      );
    }

    return jobs;
  }

  async regenerateTypography(
    brandId: Types.ObjectId,
    businessName: string,
    tagline: string,
    brandStyles: string[],
    industry: string,
    priority: number = JOB_PRIORITIES.NORMAL,
  ) {
    const jobData: any = { brandId, businessName, tagline, brandStyles, industry };
    const job = await this.typographyRegenerateQueue.add(
      REGENERATE_JOB_NAMES.TYPOGRAPHY_REGENERATE,
      jobData,
      {
        jobId: `typography-${brandId}`,
        priority,
      },
    );

    this.logger.log(`Added typography regeneration job: ${job.id} for brand: ${brandId}`);
    return job;
  }

  async regenerateBanner(
    brandId: Types.ObjectId,
    brandName: string,
    tagline: string,
    brandStyles: string[],
    industry: string,
    variant: BannerVariant,
    colors: string[],
    priority: number = JOB_PRIORITIES.NORMAL,
  ) {
    // BANNER_TWITTER_REGENERATE = 'banner-twitter-regeneration',
    const jobData: BannerGenerationJobData = { brandId, brandName, tagline, brandStyles, industry, variant, colors };
    const jobId = `banner-${variant}-regeneration-${brandId}`;

    const existingJob = await this.bannerRegenerateQueue.getJob(jobId);
      if (existingJob) {
        await existingJob.remove();
      }


    const job = await this.bannerRegenerateQueue.add(
      REGENERATE_JOB_NAMES.BANNER_REGENERATE,
      jobData,
      {
        jobId,
        priority,
      },
    );

    this.logger.log(`Added banner regeneration job: ${job.id} (type=${variant}) for brand: ${brandId}`);
    return job;
  }

  async regenerateMission(
    brandId: Types.ObjectId,
    businessName: string,
    tagline: string,
    industry: string,
    brandStyles: string[],
    priority: number = JOB_PRIORITIES.NORMAL,
  ) {
    const jobData: any = { brandId, businessName, tagline, industry, brandStyles };
    const job = await this.missionRegenerateQueue.add(
      REGENERATE_JOB_NAMES.MISSION_REGENERATE,
      jobData,
      {
        jobId: `mission-${brandId}`,
        priority,
      },
    );

    this.logger.log(`Added mission regeneration job: ${job.id} for brand: ${brandId}`);
    return job;
  }

  async regenerateVision(
    brandId: Types.ObjectId,
    businessName: string,
    tagline: string,
    industry: string,
    brandStyles: string[],
    priority: number = JOB_PRIORITIES.NORMAL,
  ) {
    const jobData: any = { brandId, businessName, tagline, industry, brandStyles };
    const job = await this.visionRegenerateQueue.add(
      REGENERATE_JOB_NAMES.VISION_REGENERATE,
      jobData,
      {
        jobId: `vision-${brandId}`,
        priority,
      },
    );

    this.logger.log(`Added vision regeneration job: ${job.id} for brand: ${brandId}`);
    return job;
  }

  private mapJobTypeToQueue(jobType: RegenerateJobType): Queue {
    switch (jobType) {
      case RegenerateJobType.WEBSITE_REGENERATE:
        return this.websiteRegenerateQueue;

      case RegenerateJobType.MISSION_REGENERATE:
        return this.missionRegenerateQueue;

      case RegenerateJobType.VISION_REGENERATE:
        return this.visionRegenerateQueue;

      case RegenerateJobType.LOGO_PRIMARY_REGENERATE:
      case RegenerateJobType.LOGO_ICON_REGENERATE:
        return this.logoRegenerateQueue;

      case RegenerateJobType.TYPOGRAPHY_REGENERATE:
        return this.typographyRegenerateQueue;

      case RegenerateJobType.COLOR_PALETTE_REGENERATE:
        return this.colorRegenerateQueue;

      case RegenerateJobType.BANNER_FACEBOOK_REGENERATE:
      case RegenerateJobType.BANNER_INSTAGRAM_REGENERATE:
      case RegenerateJobType.BANNER_LINKEDIN_REGENERATE:
      case RegenerateJobType.BANNER_TWITTER_REGENERATE:
        return this.bannerRegenerateQueue;

      default:
        throw new Error(`Unsupported job type: ${RegenerateJobType}`);
    }
  }

  async getJobStatus(brandId: string, jobType: RegenerateJobType): Promise<any> {
    const queue = this.mapJobTypeToQueue(jobType);


    const jobId = `${jobType}-${brandId}`;
    const job = await queue.getJob(jobId);

    if (!job) {
      this.logger.warn(`No job found for ${jobId}`);
      return { brandId, jobType, status: 'not-found', message: 'No job found for this brand and type' };
    }

    const state = await job.getState();

    return {
      brandId,
      jobType,
      state,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
    };
  }
}
