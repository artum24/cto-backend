import {
  Catch,
  ArgumentsHost,
  HttpException,
  type HttpServer,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { ApolloError, ForbiddenError, AuthenticationError } from 'apollo-server-core';

const isProduction = process.env.NODE_ENV === 'production';

// Errors whose messages are safe to expose to the client
const SAFE_EXCEPTION_TYPES = [
  'BadRequestException',
  'UnauthorizedException',
  'ForbiddenException',
  'NotFoundException',
  'ConflictException',
  'UnprocessableEntityException',
];

const DEFAULT_GQL_PATH = '/graphql';

@Catch()
export class GraphQLExceptionFilter
  extends BaseExceptionFilter
  implements GqlExceptionFilter
{
  constructor(httpAdapter: HttpServer) {
    super(httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    // Global filter runs for all HTTP routes; only normalize errors for GraphQL HTTP.
    if (host.getType() === 'http') {
      const req = host.switchToHttp().getRequest<{ url?: string; path?: string }>();
      const path = (req.path ?? req.url?.split('?')[0] ?? '').split('?')[0];
      const gqlPath = process.env.GRAPHQL_PATH ?? DEFAULT_GQL_PATH;
      if (path !== gqlPath && !path.startsWith(`${gqlPath}/`)) {
        return super.catch(exception, host);
      }
    } else {
      // ws / rpc / etc. — BaseExceptionFilter needs HTTP response; rethrow for other contexts
      throw exception;
    }

    GqlArgumentsHost.create(host);

    if (exception instanceof ApolloError) {
      return exception;
    }

    if (exception instanceof HttpException) {
      const name = exception.constructor.name;
      const message = this.extractHttpMessage(exception);

      if (name === 'UnauthorizedException') {
        throw new AuthenticationError(message);
      }
      if (name === 'ForbiddenException') {
        throw new ForbiddenError(message);
      }
      if (SAFE_EXCEPTION_TYPES.includes(name)) {
        throw new ApolloError(message, name.replace('Exception', '').toUpperCase());
      }
    }

    // In production: hide internal error details to prevent info leakage
    const safeMessage = isProduction
      ? 'Internal server error'
      : (exception as Error)?.message || 'Internal server error';

    throw new ApolloError(safeMessage, 'INTERNAL_SERVER_ERROR');
  }

  private extractHttpMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') return response;
    if (typeof response === 'object' && response !== null) {
      const r = response as Record<string, unknown>;
      if (typeof r['message'] === 'string') return r['message'];
      if (Array.isArray(r['message'])) return (r['message'] as string[]).join(', ');
    }
    return exception.message;
  }
}
