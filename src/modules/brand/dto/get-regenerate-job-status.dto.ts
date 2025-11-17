import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RegenerateJobType } from 'src/modules/queue/constants/regenerate-queue.constants';



export class GetRegeneratedJobStatusDto {
  @ApiProperty({
    example: RegenerateJobType.WEBSITE_REGENERATE,
    enum: RegenerateJobType,
    enumName: 'RegenerateJobType', // 👈 Ensures Swagger renders a dropdown
    description: 'Select the type of job to check the status for',
  })
  @IsEnum(RegenerateJobType)
  jobType: RegenerateJobType;


}
