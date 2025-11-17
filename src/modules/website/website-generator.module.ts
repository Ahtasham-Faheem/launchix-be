// website-generator.module.ts
import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { Website, WebsiteSchema } from './schemas/wesbite.schema';
import { WebsiteGeneratorController } from './controllers/website-generator.controller';
import { WebsiteGeneratorService } from './services/website-generator.service';
import { AuthModule } from '../auth/auth.module';
import { ModernWebsiteGeneratorController } from './controllers/modern-wesite-generator.controller';
import { ModernWebsiteGeneratorService } from './services/modern-websit-generator.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Website.name, schema: WebsiteSchema }
    ]),
    AuthModule
  ],
  controllers: [WebsiteGeneratorController, ModernWebsiteGeneratorController],
  providers: [WebsiteGeneratorService, ModernWebsiteGeneratorService],
  exports: [WebsiteGeneratorService],
})
export class WebsiteGeneratorModule {}