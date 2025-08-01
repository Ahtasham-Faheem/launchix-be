import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateProjectDto {
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsOptional()
  @IsString()
  projectName?: string;
}
