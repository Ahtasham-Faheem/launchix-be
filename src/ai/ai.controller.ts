// ai.controller.ts
import { Body, Controller, Post, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AIService } from './ai.service';
import { AuthGuard } from '../guard/auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('ai')
@UseGuards(AuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) { }

  @Post('generate-text')
  async generateText(@Body('prompt') prompt: string) {
    return this.aiService.generateText(prompt);
  }

  @Post('generate-template')
  async generateTemplate(
    @Body('prompt') prompt: string,
    @Body('userId') userId: string
  ) {
    return this.aiService.generateTemplate(prompt, userId);
  }

  @Post('generate-website-content')
  async generateWebsiteContent(@Body('projectId') projectId: string) {
    return this.aiService.generateWebsiteContent(projectId);
  }

  @Post('update-component-content')
  async updateComponentContent(
    @Body('prompt') prompt: string,
    @Body('componentType') componentType: string,
    @Body('currentContent') currentContent: string,
  ) {
    return this.aiService.updateComponentContent(prompt, componentType, currentContent);
  }
  @Post('generate-logo')
  async generateLogo(@Body() body: any) {
    return this.aiService.generateLogo(body);
  }

  @Post('save-logo')
  @UseInterceptors(FileInterceptor('logo'))
  async saveLogo(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.aiService.saveLogo(file, body);
  }
}