import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GraphQLExceptionFilter } from '@/common/filters/graphql-exception.filter';
import helmet from 'helmet';

export function configureHttpApp(app: INestApplication): void {
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
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
