import { Body, Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { ParsePromptDto } from './dto/prompt.dto';
import { RegenerateFieldsDto } from './dto/regenerate.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@ApiTags('brand')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('brand')
export class BrandController {
  constructor(private readonly service: BrandService) {}

  @Post('parse')
  async parse(@Body() dto: ParsePromptDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.service.createFromPrompt(user, dto.prompt);
  }

  @Post(':id/regenerate')
  async regenerate(@Param('id') id: string, @Body() dto: RegenerateFieldsDto) {
    return this.service.regenerate(id, dto);
  }

  @Post(':id/build-assets')
  async build(@Param('id') id: string) {
    return this.service.buildAssets(id);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.getBrand(id);
  }
}
