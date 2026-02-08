import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { SupabaseAdminClient } from './supabase.client';
import type { Prisma as PrismaTypes } from '@prisma/client';
import jwt from 'jsonwebtoken';

type UserRecord = PrismaTypes.usersGetPayload<{ include: { companies: true } }>;

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
    return header.replace('Bearer ', '').trim();
  }

  private async fetchSupabaseUser(token: string): Promise<{
    authUserId: string;
    supabaseUser: {
      id: string;
      email?: string | null;
      user_metadata?: unknown;
    };
  }> {
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

    const decoded = jwt.decode(token) as {
      sub?: string;
      email?: string;
    } | null;
    if (decoded?.sub) {
      return {
        authUserId: decoded.sub,
        supabaseUser: {
          id: decoded.sub,
          email: decoded.email ?? null,
          user_metadata: decoded,
        },
      };
    }

    throw new UnauthorizedException(
      'Supabase token verification failed (check SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or token validity)',
    );
  }
}
