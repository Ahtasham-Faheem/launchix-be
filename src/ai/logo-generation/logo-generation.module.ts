import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LogoController } from './controllers/logo.controller';
import { LogoService } from './services/logo.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { DallEProvider } from './providers/dall-e.provider';
import { MidjourneyProvider } from './providers/midjourney.provider';
import { StableDiffusionProvider } from './providers/stable-diffusion.provider';

@Module({
    imports: [ConfigModule],
    controllers: [LogoController],
    providers: [
        LogoService,
        PromptBuilderService,
        DallEProvider,
        MidjourneyProvider,
        StableDiffusionProvider,
    ],
    exports: [LogoService],
})
export class LogoGenerationModule { }