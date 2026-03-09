import { Catch, ArgumentsHost } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-core';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    if (exception instanceof ApolloError) {
      return exception;
    }

    const error = exception as Error;
    throw new ApolloError(error.message || 'Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}
