import { Body, Controller, Post } from '@nestjs/common';
import { LogoService } from './logo.service';
import { GenerateLogoDto } from './dto/generate-logo.dto';

@Controller('ai/logo')
export class LogoController {
  constructor(private readonly logoService: LogoService) {}

  @Post('generate')
  async generate(@Body() data: GenerateLogoDto) {
    return this.logoService.generateLogo(data);
  }
}
