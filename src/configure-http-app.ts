import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GraphQLExceptionFilter } from '@/common/filters/graphql-exception.filter';
import helmet from 'helmet';

const isProduction = process.env.NODE_ENV === 'production';
const apolloSandboxEnabled = process.env.ENABLE_APOLLO_SANDBOX === 'true';

function contentSecurityPolicy():
  | false
  | undefined
  | { directives: Record<string, null | string[] | Iterable<string>> } {
  if (!isProduction) {
    return false;
  }
  if (!apolloSandboxEnabled) {
    return undefined;
  }
  return {
    directives: {
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://embeddable-sandbox.cdn.apollographql.com',
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https://apollo-server-landing-page.cdn.apollographql.com',
      ],
      connectSrc: [
        "'self'",
        'https://embeddable-sandbox.cdn.apollographql.com',
        'https://apollo-server-landing-page.cdn.apollographql.com',
        'https://sandbox.embed.apollographql.com',
      ],
      manifestSrc: ['https://apollo-server-landing-page.cdn.apollographql.com'],
      frameSrc: [
        "'self'",
        'https://embeddable-sandbox.cdn.apollographql.com',
        'https://sandbox.embed.apollographql.com',
      ],
    },
  };
}

export function configureHttpApp(app: INestApplication): void {
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: contentSecurityPolicy(),
    }),
  );

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GraphQLExceptionFilter());
}
