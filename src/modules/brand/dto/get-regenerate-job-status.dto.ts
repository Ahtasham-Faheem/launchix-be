import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsArray, ArrayNotEmpty } from 'class-validator';
import { RegenerateJobType } from 'src/modules/queue/constants/regenerate-queue.constants';

export class GetRegeneratedJobStatusDto {
  @ApiProperty({
    example: [RegenerateJobType.WEBSITE_REGENERATE, RegenerateJobType.LOGO_PRIMARY_REGENERATE],
    enum: RegenerateJobType,
    enumName: 'RegenerateJobType',
    description: 'Select the types of jobs to check the status for',
    isArray: true,
    type: [RegenerateJobType],
  })
  @IsArray()
  @ArrayNotEmpty() // 👈 Ensures the array is not empty
  @IsEnum(RegenerateJobType, { each: true })
  jobTypes: RegenerateJobType[];
}