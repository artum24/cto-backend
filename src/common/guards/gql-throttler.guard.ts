import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';

/**
 * Default ThrottlerGuard uses switchToHttp(); GraphQL field resolvers get no HTTP req there.
 * Use req/res from Apollo context (see GraphQLModule context callback).
 *
 * Subscriptions are long-lived WS connections — rate limiting per-event makes no sense,
 * so we skip throttling for them entirely.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo<{ operation?: { operation?: string } }>();
    if (info?.operation?.operation === 'subscription') return true;
    return super.canActivate(context);
  }

  protected getRequestResponse(context: ExecutionContext): {
    req: Record<string, unknown>;
    res: Record<string, unknown>;
  } {
    const gqlCtx = GqlExecutionContext.create(context);
    const apollo = gqlCtx.getContext<{ req?: Request; res?: Response }>();
    if (apollo?.req && apollo?.res) {
      return {
        req: apollo.req as unknown as Record<string, unknown>,
        res: apollo.res as unknown as Record<string, unknown>,
      };
    }
    return super.getRequestResponse(context);
  }
}
