// ai.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Project, ProjectSchema } from '../project/schemas/project.schema'; // ✅ Import project schema
import { LogoModule } from './logo/logo.module';
import { LogoGenerationModule } from './logo-generation/logo-generation.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    LogoModule,
    LogoGenerationModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema } // ✅ Register Project schema
    ]),
  ],
  controllers: [AIController],
  providers: [AIService],
})
export class AIModule {}
