import { Module } from '@nestjs/common';
import { PrintifyController } from './printify.controller';
import { PrintifyService } from './printify.service';

@Module({
  controllers: [PrintifyController],
  providers: [PrintifyService],
})
export class PrintifyModule {}
