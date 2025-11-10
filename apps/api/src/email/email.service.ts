import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private readonly from: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>('EMAIL_FROM', 'noreply@innovationlab.com');
    this.baseUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');

    // Initialize email transporter
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailService = this.config.get<string>('EMAIL_SERVICE');
    const emailHost = this.config.get<string>('EMAIL_HOST');
    const emailPort = this.config.get<number>('EMAIL_PORT', 587);
    const emailUser = this.config.get<string>('EMAIL_USER');
    const emailPassword = this.config.get<string>('EMAIL_PASSWORD');

    if (emailService === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });
    } else if (emailHost) {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });
    } else {
      // Development mode - use ethereal email
      this.logger.warn('No email configuration found. Using console logging mode.');
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    }
  }

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    try {
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to load email template: ${templateName}`, error);
      throw new Error(`Email template not found: ${templateName}`);
    }
  }

  private replaceTemplateVariables(template: string, context: Record<string, any>): string {
    let result = template;

    // Replace all {{variable}} with actual values
    Object.keys(context).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, context[key]);
    });

    // Add base URL if not provided
    if (!context.baseUrl) {
      result = result.replace(/{{baseUrl}}/g, this.baseUrl);
    }

    return result;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Load and process template
      const template = this.loadTemplate(options.template);
      const html = this.replaceTemplateVariables(template, options.context);

      // Send email
      const mailOptions = {
        from: this.from,
        to: options.to,
        subject: options.subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent successfully to ${options.to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  // Specific email methods

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Innovation Lab! 🚀',
      template: 'welcome',
      context: {
        name,
        loginUrl: `${this.baseUrl}/login`,
        dashboardUrl: `${this.baseUrl}/dashboard`,
      },
    });
  }

  async sendLevelUpEmail(
    email: string,
    name: string,
    level: number,
    levelName: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Congratulations! You reached Level ${level} 🎉`,
      template: 'level-up',
      context: {
        name,
        level,
        levelName,
        leaderboardUrl: `${this.baseUrl}/leaderboard`,
      },
    });
  }

  async sendBadgeUnlockedEmail(
    email: string,
    name: string,
    badgeName: string,
    badgeIcon: string,
    badgeDescription: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `New Badge Unlocked: ${badgeName} ${badgeIcon}`,
      template: 'badge-unlocked',
      context: {
        name,
        badgeName,
        badgeIcon,
        badgeDescription,
        badgesUrl: `${this.baseUrl}/profile/badges`,
      },
    });
  }

  async sendWinnerAnnouncementEmail(
    email: string,
    name: string,
    hackathonTitle: string,
    rank: number,
    prize?: string
  ): Promise<void> {
    const rankText = rank === 1 ? '1st Place 🥇' : rank === 2 ? '2nd Place 🥈' : '3rd Place 🥉';

    await this.sendEmail({
      to: email,
      subject: `You won ${rankText} in ${hackathonTitle}! 🏆`,
      template: 'winner-announcement',
      context: {
        name,
        hackathonTitle,
        rankText,
        prize: prize || 'Recognition',
        dashboardUrl: `${this.baseUrl}/dashboard`,
      },
    });
  }

  async sendChallengeAcceptedEmail(
    email: string,
    name: string,
    challengeTitle: string,
    challengeSlug: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Your solution for "${challengeTitle}" was accepted! ✅`,
      template: 'challenge-accepted',
      context: {
        name,
        challengeTitle,
        challengeUrl: `${this.baseUrl}/challenges/${challengeSlug}`,
        solutionsUrl: `${this.baseUrl}/challenges/my-solutions`,
      },
    });
  }

  async sendChallengeWinnerEmail(
    email: string,
    name: string,
    challengeTitle: string,
    challengeSlug: string,
    reward?: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `You won the "${challengeTitle}" challenge! 🎉`,
      template: 'challenge-winner',
      context: {
        name,
        challengeTitle,
        reward: reward || 'Recognition and XP',
        challengeUrl: `${this.baseUrl}/challenges/${challengeSlug}`,
        dashboardUrl: `${this.baseUrl}/dashboard`,
      },
    });
  }

  async sendTeamInvitationEmail(
    email: string,
    inviteeName: string,
    teamName: string,
    inviterName: string,
    hackathonTitle: string,
    hackathonSlug: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `You've been invited to join ${teamName} 👥`,
      template: 'team-invitation',
      context: {
        inviteeName,
        teamName,
        inviterName,
        hackathonTitle,
        hackathonUrl: `${this.baseUrl}/hackathons/${hackathonSlug}`,
        dashboardUrl: `${this.baseUrl}/dashboard`,
      },
    });
  }

  async sendTeamInvitationAcceptedEmail(
    email: string,
    inviterName: string,
    inviteeName: string,
    teamName: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `${inviteeName} accepted your team invitation`,
      template: 'team-invitation-accepted',
      context: {
        inviterName,
        inviteeName,
        teamName,
        dashboardUrl: `${this.baseUrl}/dashboard`,
      },
    });
  }

  async sendSubmissionConfirmationEmail(
    email: string,
    name: string,
    hackathonTitle: string,
    hackathonSlug: string,
    teamName: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Submission confirmed for ${hackathonTitle} ✓`,
      template: 'submission-confirmation',
      context: {
        name,
        hackathonTitle,
        teamName,
        hackathonUrl: `${this.baseUrl}/hackathons/${hackathonSlug}`,
        dashboardUrl: `${this.baseUrl}/dashboard`,
      },
    });
  }

  async sendHackathonRegistrationEmail(
    email: string,
    name: string,
    hackathonTitle: string,
    hackathonSlug: string,
    teamName: string,
    startsAt: string,
    endsAt: string,
    location: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `You're registered for ${hackathonTitle}! 🎉`,
      template: 'hackathon-registration-confirmed',
      context: {
        name,
        hackathonTitle,
        teamName,
        startsAt,
        endsAt,
        location,
        hackathonUrl: `${this.baseUrl}/hackathons/${hackathonSlug}`,
      },
    });
  }

  async sendSubmissionReceivedEmail(
    email: string,
    name: string,
    hackathonTitle: string,
    hackathonSlug: string,
    submissionTitle: string,
    teamName: string,
    submittedAt: string,
    resultsDate: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Submission received for ${hackathonTitle} 🎯`,
      template: 'submission-received',
      context: {
        name,
        hackathonTitle,
        submissionTitle,
        teamName,
        submittedAt,
        resultsDate,
        submissionUrl: `${this.baseUrl}/hackathons/${hackathonSlug}/submissions`,
      },
    });
  }

  async sendJudgeAssignedEmail(
    email: string,
    name: string,
    hackathonTitle: string,
    hackathonSlug: string,
    hackathonDescription: string,
    submissionCount: number,
    judgesCount: number,
    judgingStartDate: string,
    judgingEndDate: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `You've been assigned as a judge for ${hackathonTitle} ⚖️`,
      template: 'judge-assigned',
      context: {
        name,
        hackathonTitle,
        hackathonDescription,
        submissionCount,
        judgesCount,
        judgingStartDate,
        judgingEndDate,
        judgingUrl: `${this.baseUrl}/hackathons/${hackathonSlug}/judging`,
      },
    });
  }

  async sendMentorAssignedEmail(
    email: string,
    name: string,
    hackathonTitle: string,
    hackathonSlug: string,
    hackathonDescription: string,
    startsAt: string,
    endsAt: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Welcome as a mentor for ${hackathonTitle} 🎓`,
      template: 'mentor-assigned',
      context: {
        name,
        hackathonTitle,
        hackathonDescription,
        startsAt,
        endsAt,
        mentorUrl: `${this.baseUrl}/hackathons/${hackathonSlug}/mentors`,
      },
    });
  }

  async sendJudgingCompleteEmail(
    email: string,
    name: string,
    hackathonTitle: string,
    hackathonSlug: string,
    submissionTitle: string,
    teamName: string,
    totalScore: number,
    feedbackSummary: string,
    announcementDate: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Judging complete for ${hackathonTitle} 📊`,
      template: 'judging-complete',
      context: {
        name,
        hackathonTitle,
        submissionTitle,
        teamName,
        totalScore,
        feedbackSummary,
        announcementDate,
        resultsUrl: `${this.baseUrl}/hackathons/${hackathonSlug}/results`,
      },
    });
  }

  async sendChallengeSubmissionEmail(
    email: string,
    name: string,
    challengeTitle: string,
    challengeSlug: string,
    submittedAt: string,
    reviewDays: number
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Challenge submission received for "${challengeTitle}" ✅`,
      template: 'challenge-submission-received',
      context: {
        name,
        challengeTitle,
        submittedAt,
        reviewDays,
        challengeUrl: `${this.baseUrl}/challenges/${challengeSlug}`,
      },
    });
  }

  async sendChallengeReviewedEmail(
    email: string,
    name: string,
    challengeTitle: string,
    challengeSlug: string,
    status: string,
    feedback: string,
    score?: number
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Your "${challengeTitle}" submission has been reviewed 📝`,
      template: 'challenge-reviewed',
      context: {
        name,
        challengeTitle,
        status,
        feedback,
        score,
        submissionUrl: `${this.baseUrl}/challenges/${challengeSlug}/my-submission`,
      },
    });
  }
}
