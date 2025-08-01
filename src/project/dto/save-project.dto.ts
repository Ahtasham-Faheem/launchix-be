import { IsObject, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class SaveProjectDto {
  @IsString()
  projectId: string;

  @IsOptional()
  userId?: Types.ObjectId;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  businessDetails?: object;

  @IsOptional()
  @IsObject()
  data?: object;

  @IsOptional()
  @IsString()
  thumbnail?: string;
}