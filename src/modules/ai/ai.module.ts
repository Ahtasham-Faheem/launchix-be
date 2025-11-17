import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { RegenAiService } from './regen-ai.service';

@Module({
    imports: [CloudinaryModule],
    providers: [AiService, RegenAiService],
    exports: [AiService, RegenAiService]
})
export class AiModule { }
