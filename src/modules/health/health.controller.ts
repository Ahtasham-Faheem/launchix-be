import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../queue/constants/queue.constants';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectQueue(QUEUE_NAMES.COLOR_GENERATION) private colorQueue: Queue,
    @InjectQueue(QUEUE_NAMES.LOGO_GENERATION) private logoQueue: Queue,
    @InjectQueue(QUEUE_NAMES.WEBSITE_GENERATION) private websiteQueue: Queue,
    @InjectQueue(QUEUE_NAMES.MOCKUP_GENERATION) private mockupQueue: Queue,
    @InjectQueue(QUEUE_NAMES.ASSET_AGGREGATION) private assetQueue: Queue,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('queues')
  @ApiOperation({ summary: 'Queue health status' })
  async queueHealth() {
    const queues = [
      { name: QUEUE_NAMES.COLOR_GENERATION, queue: this.colorQueue },
      { name: QUEUE_NAMES.LOGO_GENERATION, queue: this.logoQueue },
      { name: QUEUE_NAMES.WEBSITE_GENERATION, queue: this.websiteQueue },
      { name: QUEUE_NAMES.MOCKUP_GENERATION, queue: this.mockupQueue },
      { name: QUEUE_NAMES.ASSET_AGGREGATION, queue: this.assetQueue },
    ];

    const statuses = await Promise.all(
      queues.map(async ({ name, queue }) => {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
        ]);

        return {
          name,
          waiting,
          active,
          completed,
          failed,
          delayed,
          isPaused: await queue.isPaused(),
        };
      }),
    );

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      queues: statuses,
    };
  }

  @Get('redis')
  @ApiOperation({ summary: 'Redis connection health' })
  async redisHealth() {
    try {
      const client = await this.colorQueue.client;
      await client.ping();

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        redis: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        redis: 'disconnected',
        error: error.message,
      };
    }
  }
}