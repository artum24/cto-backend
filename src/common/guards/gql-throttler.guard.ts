import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';

/**
 * Default ThrottlerGuard uses switchToHttp(); GraphQL field resolvers get no HTTP req there.
 * Use req/res from Apollo context (see GraphQLModule context callback).
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
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
