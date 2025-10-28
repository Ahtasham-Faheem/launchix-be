import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { S3Service } from '../../shared/s3/s3.service';
import { AuthModule } from '../auth/auth.module'; // ✅ Import the module that provides AuthService & AuthGuard

@Module({
  imports: [AuthModule], // ✅ Add this line
  controllers: [UploadController],
  providers: [S3Service],
})
export class UploadModule {}
