import { Module } from '@nestjs/common';
import { HostingService } from './hosting.service';
import { HostingController } from './hosting.controller';
import { AuthGuard } from '../auth/auth.guard'; // Import your guard
import { BrandModule } from '../brand/brand.module';

@Module({
    imports: [BrandModule],
    controllers: [HostingController],
    providers: [HostingService, AuthGuard],
    exports: [HostingService],
})
export class HostingModule { }
