import NextAuth, { DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { prisma } from '@innovation-lab/database';
import { compare } from 'bcryptjs';
import { z } from 'zod';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      roles: string[];
      handle?: string;
    } & DefaultSession['user'];
  }

  interface User {
    roles: string[];
    handle?: string;
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const authConfig = NextAuth({
  // @ts-expect-error - Adapter type compatibility issue with NextAuth v5
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/dashboard',
  },
  providers: [
    // Email/Password Authentication
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              email: true,
              name: true,
              handle: true,
              avatarUrl: true,
              password: true,
              roles: true,
              emailVerified: true,
              isActive: true,
              isBanned: true,
            },
          });

          // Check if user exists
          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Check if account is active
          if (user.isBanned) {
            throw new Error('Account has been banned');
          }

          if (!user.isActive) {
            throw new Error('Account is not active');
          }

          // Verify password
          if (!user.password) {
            throw new Error('Invalid authentication method');
          }

          const isValidPassword = await compare(password, user.password);
          if (!isValidPassword) {
            throw new Error('Invalid email or password');
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          // Return user without password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatarUrl,
            roles: user.roles,
            handle: user.handle || undefined,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),

    // Microsoft Entra ID (Azure AD) SSO
    ...(process.env.MICROSOFT_CLIENT_ID
      ? [
          AzureADProvider({
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
            issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'common'}/v2.0`,
            authorization: {
              params: {
                scope: 'openid profile email User.Read',
              },
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.handle = user.handle;
      }

      // Update token on session update
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
        session.user.handle = token.handle as string;
      }
      return session;
    },
    async signIn({ account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') {
        return true;
      }

      // Allow login even without verification (can add verification requirement later)
      return true;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log sign in event
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'USER_SIGNIN',
          entityType: 'USER',
          entityId: user.id,
          metadata: {
            provider: account?.provider,
            isNewUser,
          },
        },
      });
    },
    async signOut(params) {
      // Log sign out event
      const token = 'token' in params ? params.token : null;
      if (token?.id) {
        await prisma.auditLog.create({
          data: {
            actorId: token.id as string,
            action: 'USER_SIGNOUT',
            entityType: 'USER',
            entityId: token.id as string,
          },
        });
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
});

export const handlers: typeof authConfig.handlers = authConfig.handlers;
export const signIn: typeof authConfig.signIn = authConfig.signIn;
export const signOut: typeof authConfig.signOut = authConfig.signOut;
export const auth: typeof authConfig.auth = authConfig.auth;

// Helper function to get session on server
export async function getSession() {
  return await auth();
}

// Helper to check if user has role
export function hasRole(session: DefaultSession | null, role: string): boolean {
  if (!session?.user) return false;
  const user = session.user as { roles?: string[] };
  return user.roles?.includes(role) || false;
}

// Helper to check if user has any of the roles
export function hasAnyRole(session: DefaultSession | null, roles: string[]): boolean {
  if (!session?.user) return false;
  const user = session.user as { roles?: string[] };
  const userRoles = user.roles || [];
  return roles.some(role => userRoles.includes(role));
}
