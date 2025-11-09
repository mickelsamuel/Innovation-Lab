import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailHackathonRegistration?: boolean;

  @IsOptional()
  @IsBoolean()
  emailSubmissionReceived?: boolean;

  @IsOptional()
  @IsBoolean()
  emailJudgeAssigned?: boolean;

  @IsOptional()
  @IsBoolean()
  emailMentorAssigned?: boolean;

  @IsOptional()
  @IsBoolean()
  emailJudgingComplete?: boolean;

  @IsOptional()
  @IsBoolean()
  emailWinnerAnnouncement?: boolean;

  @IsOptional()
  @IsBoolean()
  emailChallengeSubmission?: boolean;

  @IsOptional()
  @IsBoolean()
  emailChallengeReviewed?: boolean;

  @IsOptional()
  @IsBoolean()
  emailChallengeAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  emailChallengeWinner?: boolean;

  @IsOptional()
  @IsBoolean()
  emailTeamInvitation?: boolean;

  @IsOptional()
  @IsBoolean()
  emailTeamInvitationAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  emailLevelUp?: boolean;

  @IsOptional()
  @IsBoolean()
  emailBadgeUnlocked?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppHackathonRegistration?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppSubmissionReceived?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppJudgeAssigned?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppMentorAssigned?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppJudgingComplete?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppWinnerAnnouncement?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppChallengeSubmission?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppChallengeReviewed?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppChallengeAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppChallengeWinner?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppTeamInvitation?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppTeamInvitationAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppLevelUp?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppBadgeUnlocked?: boolean;
}
