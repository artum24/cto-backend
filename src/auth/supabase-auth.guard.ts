import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '@/prisma/prisma.service';
import { Request } from 'express';
import { SupabaseAdminClient } from './supabase.client';
import type { users, companies } from '@prisma/client';
import jwt from 'jsonwebtoken';

type UserRecord = users & { companies?: companies | null };

export type AuthContextUser = {
  authUserId: string;
  user: UserRecord;
  authUser: { id: string; email?: string | null; role?: string | null };
};

type ReqWithUser = Request & { user?: AuthContextUser };

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminClient,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = this.getRequest(context);
    const token = this.extractToken(req);
    const { authUserId, supabaseUser } = await this.fetchSupabaseUser(token);

    const user = await this.prisma.users.findUnique({
      where: { auth_user_id: authUserId },
      include: { companies: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    req.user = {
      authUserId,
      user,
      authUser: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role:
          supabaseUser.user_metadata &&
          typeof supabaseUser.user_metadata === 'object'
            ? ((
                supabaseUser.user_metadata as Record<string, unknown>
              )?.role?.toString() ?? null)
            : null,
      },
    };
    return true;
  }

  private getRequest(context: ExecutionContext): { req: ReqWithUser } {
    if (context.getType() === 'http') {
      return { req: context.switchToHttp().getRequest() };
    }
    const gqlCtx = GqlExecutionContext.create(context).getContext<{
      req: ReqWithUser;
    }>();
    return { req: gqlCtx.req };
  }

  private extractToken(req: ReqWithUser): string {
    const header =
      req.headers?.authorization ||
      (req.headers as Record<string, string | undefined>)?.Authorization;
    if (
      !header ||
      typeof header !== 'string' ||
      !header.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }
    const raw = header.replace(/^Bearer\s+/i, '').trim();
    if (!raw) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }
    return raw;
  }

  /**
   * When `SUPABASE_JWT_SECRET` is set (JWT secret from Supabase project settings),
   * validate the access token locally — same trust model as GoTrue, without a
   * round-trip on every request. If unset, only `auth.getUser(jwt)` is used.
   */
  private tryAuthFromLocalJwt(token: string): {
    authUserId: string;
    supabaseUser: {
      id: string;
      email?: string | null;
      user_metadata?: unknown;
    };
  } | null {
    const secret = this.config.get<string>('SUPABASE_JWT_SECRET');
    if (!secret) {
      return null;
    }
    try {
      const payload = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      }) as jwt.JwtPayload & {
        email?: string;
        user_metadata?: unknown;
      };
      if (!payload.sub || typeof payload.sub !== 'string') {
        return null;
      }
      return {
        authUserId: payload.sub,
        supabaseUser: {
          id: payload.sub,
          email: payload.email ?? null,
          user_metadata: payload.user_metadata,
        },
      };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        return null;
      }
      throw err;
    }
  }

  private async fetchSupabaseUser(token: string): Promise<{
    authUserId: string;
    supabaseUser: {
      id: string;
      email?: string | null;
      user_metadata?: unknown;
    };
  }> {
    const fromJwt = this.tryAuthFromLocalJwt(token);
    if (fromJwt) {
      return fromJwt;
    }

    const { data } = await this.supabaseAdmin.client.auth.getUser(token);

    if (data?.user) {
      return {
        authUserId: data.user.id,
        supabaseUser: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
        },
      };
    }

    throw new UnauthorizedException('Invalid or expired token');
  }
}
