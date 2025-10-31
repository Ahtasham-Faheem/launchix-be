import { Controller, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { S3Service } from '../../shared/s3/s3.service';

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly s3: S3Service) {}

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file']
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  async avatar(@UploadedFile() file: Express.Multer.File) {
    const url = await this.s3.uploadBuffer(file.buffer, 'avatars/', file.mimetype);
    return { url };
  }
}
