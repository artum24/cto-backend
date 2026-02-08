import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { User as PrismaUser, Company } from '@prisma/client';

export type SupabaseJwtPayload = {
  sub: string; // auth.users.id
  role?: string;
  exp?: number;
  [key: string]: unknown;
};

export type AuthContextUser = {
  authUserId: string;
  user: PrismaUser & { company: Company };
  payload: SupabaseJwtPayload;
};

type ReqWithUser = Request & { user?: AuthContextUser };

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = this.getRequest(context);
    const token = this.extractToken(req);
    const payload = this.verifyToken(token);

    const authUserId = payload.sub;
    if (!authUserId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { auth_user_id: authUserId },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    req.user = { authUserId, user, payload };
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

  private verifyToken(token: string): SupabaseJwtPayload {
    const secret = this.config.get<string>('SUPABASE_JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT secret is not configured');
    }
    try {
      return jwt.verify(token, secret, {
        algorithms: ['HS256'],
      }) as SupabaseJwtPayload;
    } catch {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
