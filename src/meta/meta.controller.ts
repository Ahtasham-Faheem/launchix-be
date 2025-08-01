import {
  Controller, Post, UploadedFile, UseInterceptors, Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MetaService } from './meta.service';

@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Post('post')
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @UploadedFile() image: Express.Multer.File,
    @Body('text') text: string
  ) {
    return this.metaService.postToMeta({ text, image });
  }
}
