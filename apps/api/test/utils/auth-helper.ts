import { JwtService } from '@nestjs/jwt';
import { Role } from '@innovation-lab/database';

export class AuthTestHelper {
  private static jwtService = new JwtService({
    secret: process.env.JWT_SECRET || 'test-jwt-secret',
  });

  /**
   * Generate a JWT token for testing
   */
  static generateToken(userId: string, roles: Role[] = [Role.PARTICIPANT]): string {
    return this.jwtService.sign({ sub: userId, roles }, { expiresIn: '1h' });
  }

  /**
   * Generate an admin token
   */
  static generateAdminToken(userId: string = 'admin-1'): string {
    return this.generateToken(userId, [Role.BANK_ADMIN]);
  }

  /**
   * Generate an organizer token
   */
  static generateOrganizerToken(userId: string = 'organizer-1'): string {
    return this.generateToken(userId, [Role.ORGANIZER]);
  }

  /**
   * Generate a judge token
   */
  static generateJudgeToken(userId: string = 'judge-1'): string {
    return this.generateToken(userId, [Role.JUDGE]);
  }

  /**
   * Generate a mentor token
   */
  static generateMentorToken(userId: string = 'mentor-1'): string {
    return this.generateToken(userId, [Role.MENTOR]);
  }

  /**
   * Create authorization header
   */
  static createAuthHeader(token: string): string {
    return `Bearer ${token}`;
  }

  /**
   * Decode token (for testing purposes)
   */
  static decodeToken(token: string): unknown {
    return this.jwtService.decode(token);
  }
}
