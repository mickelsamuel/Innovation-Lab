import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ReportStatus } from '@innovation-lab/database';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get moderation statistics
   */
  async getStats() {
    const [pending, investigating, resolved, dismissed] = await Promise.all([
      this.prisma.report.count({
        where: {
          status: ReportStatus.OPEN,
        },
      }),
      this.prisma.report.count({
        where: {
          status: ReportStatus.INVESTIGATING,
        },
      }),
      this.prisma.report.count({
        where: {
          status: ReportStatus.RESOLVED,
        },
      }),
      this.prisma.report.count({
        where: {
          status: ReportStatus.DISMISSED,
        },
      }),
    ]);

    return {
      pending,
      investigating,
      resolved,
      dismissed,
    };
  }

  /**
   * Get all reports with reporter information
   */
  async getReports(status?: ReportStatus) {
    const where = status ? { status } : {};

    return this.prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            handle: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
