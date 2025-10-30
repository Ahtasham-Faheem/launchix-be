import { Module } from '@nestjs/common';
import { HostingService } from './hosting.service';
import { HostingController } from './hosting.controller';
import { BrandModule } from '../brand/brand.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [BrandModule, AuthModule],
    controllers: [HostingController],
    providers: [HostingService, ],
    exports: [HostingService],
})
export class HostingModule { }
