Object.defineProperty(exports, '__esModule', { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip,
} = require('./runtime/index-browser.js');

const Prisma = {};

exports.Prisma = Prisma;
exports.$Enums = {};

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: '5.22.0',
  engine: '605197351a3c8bdd595af2d2a9bc3025bca48ea2',
};

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.Decimal = Decimal;

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.validator = Public.validator;

/**
 * Extensions
 */
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull;
Prisma.JsonNull = objectEnumValues.instances.JsonNull;
Prisma.AnyNull = objectEnumValues.instances.AnyNull;

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull,
};

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable',
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  emailVerified: 'emailVerified',
  name: 'name',
  handle: 'handle',
  avatarUrl: 'avatarUrl',
  bio: 'bio',
  organization: 'organization',
  password: 'password',
  roles: 'roles',
  totpSecret: 'totpSecret',
  totpEnabled: 'totpEnabled',
  passwordResetToken: 'passwordResetToken',
  passwordResetExpires: 'passwordResetExpires',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastLoginAt: 'lastLoginAt',
  isActive: 'isActive',
  isBanned: 'isBanned',
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state',
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires',
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires',
};

exports.Prisma.ApiKeyScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  hashedKey: 'hashedKey',
  scopes: 'scopes',
  lastUsedAt: 'lastUsedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  isActive: 'isActive',
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  actorId: 'actorId',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  metadata: 'metadata',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt',
};

exports.Prisma.HackathonScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  description: 'description',
  coverImage: 'coverImage',
  status: 'status',
  location: 'location',
  registrationOpensAt: 'registrationOpensAt',
  registrationClosesAt: 'registrationClosesAt',
  startsAt: 'startsAt',
  endsAt: 'endsAt',
  judgingEndsAt: 'judgingEndsAt',
  prizePool: 'prizePool',
  maxTeamSize: 'maxTeamSize',
  allowSoloTeams: 'allowSoloTeams',
  rules: 'rules',
  schedule: 'schedule',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.TrackScalarFieldEnum = {
  id: 'id',
  hackathonId: 'hackathonId',
  title: 'title',
  description: 'description',
  order: 'order',
  createdAt: 'createdAt',
};

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  hackathonId: 'hackathonId',
  name: 'name',
  bio: 'bio',
  logoUrl: 'logoUrl',
  repoUrl: 'repoUrl',
  demoUrl: 'demoUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.TeamMemberScalarFieldEnum = {
  teamId: 'teamId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt',
};

exports.Prisma.MentorScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  hackathonId: 'hackathonId',
  bio: 'bio',
  calendlyUrl: 'calendlyUrl',
  expertise: 'expertise',
  createdAt: 'createdAt',
};

exports.Prisma.MentorSessionScalarFieldEnum = {
  id: 'id',
  mentorId: 'mentorId',
  title: 'title',
  startsAt: 'startsAt',
  endsAt: 'endsAt',
  capacity: 'capacity',
  booked: 'booked',
  meetingUrl: 'meetingUrl',
  createdAt: 'createdAt',
};

exports.Prisma.JudgeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  hackathonId: 'hackathonId',
  bio: 'bio',
  createdAt: 'createdAt',
};

exports.Prisma.CriteriaScalarFieldEnum = {
  id: 'id',
  hackathonId: 'hackathonId',
  name: 'name',
  description: 'description',
  maxScore: 'maxScore',
  weight: 'weight',
  order: 'order',
};

exports.Prisma.SubmissionScalarFieldEnum = {
  id: 'id',
  hackathonId: 'hackathonId',
  teamId: 'teamId',
  trackId: 'trackId',
  title: 'title',
  abstract: 'abstract',
  repoUrl: 'repoUrl',
  demoUrl: 'demoUrl',
  videoUrl: 'videoUrl',
  files: 'files',
  submittedAt: 'submittedAt',
  finalizedAt: 'finalizedAt',
  status: 'status',
  scoreAggregate: 'scoreAggregate',
  rank: 'rank',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.ScoreScalarFieldEnum = {
  id: 'id',
  submissionId: 'submissionId',
  judgeId: 'judgeId',
  criterionId: 'criterionId',
  score: 'score',
  feedback: 'feedback',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.ChallengeScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  problemStatement: 'problemStatement',
  ownerId: 'ownerId',
  ownerOrg: 'ownerOrg',
  rewardType: 'rewardType',
  rewardValue: 'rewardValue',
  categories: 'categories',
  skills: 'skills',
  attachments: 'attachments',
  status: 'status',
  visibility: 'visibility',
  deadlineAt: 'deadlineAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.ChallengeSubmissionScalarFieldEnum = {
  id: 'id',
  challengeId: 'challengeId',
  userId: 'userId',
  teamId: 'teamId',
  title: 'title',
  repoUrl: 'repoUrl',
  content: 'content',
  files: 'files',
  status: 'status',
  score: 'score',
  feedback: 'feedback',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.AnnouncementScalarFieldEnum = {
  id: 'id',
  scope: 'scope',
  scopeId: 'scopeId',
  title: 'title',
  body: 'body',
  pinned: 'pinned',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.CommentThreadScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  createdAt: 'createdAt',
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  threadId: 'threadId',
  authorId: 'authorId',
  parentId: 'parentId',
  body: 'body',
  isFlagged: 'isFlagged',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.GamificationProfileScalarFieldEnum = {
  userId: 'userId',
  xp: 'xp',
  level: 'level',
  streakDays: 'streakDays',
  vaultKeys: 'vaultKeys',
  badges: 'badges',
  lastActivityAt: 'lastActivityAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.BadgeScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  name: 'name',
  description: 'description',
  icon: 'icon',
  xpRequired: 'xpRequired',
  rarity: 'rarity',
  createdAt: 'createdAt',
};

exports.Prisma.XpEventScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventType: 'eventType',
  points: 'points',
  refType: 'refType',
  refId: 'refId',
  metadata: 'metadata',
  createdAt: 'createdAt',
};

exports.Prisma.LeaderboardSnapshotScalarFieldEnum = {
  id: 'id',
  scope: 'scope',
  scopeId: 'scopeId',
  period: 'period',
  data: 'data',
  createdAt: 'createdAt',
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  data: 'data',
  readAt: 'readAt',
  createdAt: 'createdAt',
};

exports.Prisma.ReportScalarFieldEnum = {
  id: 'id',
  reporterId: 'reporterId',
  entityType: 'entityType',
  entityId: 'entityId',
  reason: 'reason',
  status: 'status',
  resolution: 'resolution',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.FileScalarFieldEnum = {
  id: 'id',
  filename: 'filename',
  mimetype: 'mimetype',
  size: 'size',
  key: 'key',
  url: 'url',
  type: 'type',
  uploadedById: 'uploadedById',
  entityId: 'entityId',
  entityType: 'entityType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc',
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull,
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive',
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last',
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull,
};
exports.Role = exports.$Enums.Role = {
  BANK_ADMIN: 'BANK_ADMIN',
  ORGANIZER: 'ORGANIZER',
  MODERATOR: 'MODERATOR',
  JUDGE: 'JUDGE',
  MENTOR: 'MENTOR',
  SPONSOR: 'SPONSOR',
  PROJECT_OWNER: 'PROJECT_OWNER',
  PARTICIPANT: 'PARTICIPANT',
  VIEWER: 'VIEWER',
};

exports.HackathonStatus = exports.$Enums.HackathonStatus = {
  DRAFT: 'DRAFT',
  UPCOMING: 'UPCOMING',
  LIVE: 'LIVE',
  JUDGING: 'JUDGING',
  CLOSED: 'CLOSED',
};

exports.HackathonLocation = exports.$Enums.HackathonLocation = {
  VIRTUAL: 'VIRTUAL',
  HYBRID: 'HYBRID',
  ONSITE: 'ONSITE',
};

exports.TeamMemberRole = exports.$Enums.TeamMemberRole = {
  LEAD: 'LEAD',
  MEMBER: 'MEMBER',
};

exports.SubmissionStatus = exports.$Enums.SubmissionStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  FINAL: 'FINAL',
  DISQUALIFIED: 'DISQUALIFIED',
};

exports.RewardType = exports.$Enums.RewardType = {
  CASH: 'CASH',
  PRIZE: 'PRIZE',
  INTERNSHIP: 'INTERNSHIP',
  RECOGNITION: 'RECOGNITION',
};

exports.ChallengeStatus = exports.$Enums.ChallengeStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  REVIEW: 'REVIEW',
  CLOSED: 'CLOSED',
};

exports.ChallengeVisibility = exports.$Enums.ChallengeVisibility = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
};

exports.ChallengeSubmissionStatus = exports.$Enums.ChallengeSubmissionStatus = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WINNER: 'WINNER',
};

exports.AnnouncementScope = exports.$Enums.AnnouncementScope = {
  GLOBAL: 'GLOBAL',
  HACKATHON: 'HACKATHON',
  CHALLENGE: 'CHALLENGE',
};

exports.CommentEntityType = exports.$Enums.CommentEntityType = {
  HACKATHON: 'HACKATHON',
  CHALLENGE: 'CHALLENGE',
  SUBMISSION: 'SUBMISSION',
  CHALLENGE_SUBMISSION: 'CHALLENGE_SUBMISSION',
};

exports.LeaderboardScope = exports.$Enums.LeaderboardScope = {
  GLOBAL: 'GLOBAL',
  HACKATHON: 'HACKATHON',
  CHALLENGE: 'CHALLENGE',
};

exports.LeaderboardPeriod = exports.$Enums.LeaderboardPeriod = {
  ALLTIME: 'ALLTIME',
  SEASON: 'SEASON',
  MONTH: 'MONTH',
  WEEK: 'WEEK',
};

exports.ReportStatus = exports.$Enums.ReportStatus = {
  OPEN: 'OPEN',
  INVESTIGATING: 'INVESTIGATING',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
};

exports.Prisma.ModelName = {
  User: 'User',
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  ApiKey: 'ApiKey',
  AuditLog: 'AuditLog',
  Hackathon: 'Hackathon',
  Track: 'Track',
  Team: 'Team',
  TeamMember: 'TeamMember',
  Mentor: 'Mentor',
  MentorSession: 'MentorSession',
  Judge: 'Judge',
  Criteria: 'Criteria',
  Submission: 'Submission',
  Score: 'Score',
  Challenge: 'Challenge',
  ChallengeSubmission: 'ChallengeSubmission',
  Announcement: 'Announcement',
  CommentThread: 'CommentThread',
  Comment: 'Comment',
  GamificationProfile: 'GamificationProfile',
  Badge: 'Badge',
  XpEvent: 'XpEvent',
  LeaderboardSnapshot: 'LeaderboardSnapshot',
  Notification: 'Notification',
  Report: 'Report',
  File: 'File',
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message;
        const runtime = getRuntime();
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message =
            'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' +
            runtime.prettyName +
            '`).';
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`;

        throw new Error(message);
      },
    });
  }
}

exports.PrismaClient = PrismaClient;

Object.assign(exports, Prisma);
