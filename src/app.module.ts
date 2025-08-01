// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { ProjectModule } from './project/project.module';
import { AIModule } from './ai/ai.module';
import { PublishModule } from './vercel/publish.module';
import { MetaModule } from './meta/meta.module';
import { PrintifyModule } from './printify/printify.module';
// import { MongooseModule } from '@nestjs/mongoose';
// import { Project, ProjectSchema } from './projects/schemas/project.schema';
// import { ProjectController } from './projects/project.controller';
// import { ProjectService } from './projects/project.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    UploadModule,
    ProjectModule,
    AIModule,
    PublishModule,
    MetaModule,
    PrintifyModule
  ],
})
export class AppModule { }