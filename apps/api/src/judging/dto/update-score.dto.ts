import { PartialType } from '@nestjs/swagger';
import { CreateScoreDto } from './create-score.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateScoreDto extends PartialType(
  OmitType(CreateScoreDto, ['criterionId'] as const)
) {}
