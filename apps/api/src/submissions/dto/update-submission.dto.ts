import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSubmissionDto } from './create-submission.dto';

export class UpdateSubmissionDto extends PartialType(
  OmitType(CreateSubmissionDto, ['hackathonId', 'teamId'] as const)
) {}
