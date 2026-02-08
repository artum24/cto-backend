import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthContextUser } from './supabase-auth.guard';
import { Request } from 'express';

type ReqWithUser = Request & { user?: AuthContextUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthContextUser | undefined => {
    const gqlCtx = GqlExecutionContext.create(context);
    const gqlContext = gqlCtx.getContext<{ req?: ReqWithUser }>();
    const req = gqlContext.req ?? context.switchToHttp().getRequest();
    return req?.user;
  },
);
