// src/publish/publish.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { VercelService } from './vercel.service';

@Controller('publish')
export class PublishController {
  constructor(private readonly publishService: VercelService) {}

  @Post('vercel')
  async publish(@Body() body: { userId: string, html: string, css: string }) {
    const { userId, html, css } = body;

    try {
      const url = await this.publishService.publishToVercel(userId, html, css);
      return { success: true, url };
    } catch (err) {
      console.error('Deployment error:', err);
      throw new HttpException('Failed to deploy to Vercel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
