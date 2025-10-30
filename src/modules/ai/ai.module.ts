import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({ imports: [CloudinaryModule], providers:[AiService], exports:[AiService] })
export class AiModule {}
