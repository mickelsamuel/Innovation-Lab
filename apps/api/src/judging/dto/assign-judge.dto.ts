import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignJudgeDto {
  @ApiProperty({
    description: 'User ID of the judge to assign',
    example: 'clu8x9y8z00001jv8h2k3l4m5',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
