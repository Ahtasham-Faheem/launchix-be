import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('/healthz')
  ok() { return { ok: true, ts: new Date().toISOString() }; }
}
