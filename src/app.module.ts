import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import Joi from 'joi';
import { Request, Response } from 'express';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { HealthModule } from '@/health/health.module';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { CompanyModule } from '@/modules/company/company.module';
import { ClientModule } from '@/modules/client/client.module';
import { VehicleModule } from '@/modules/vehicle/vehicle.module';
import { NovaPoshtaModule } from '@/modules/nova-poshta/nova-poshta.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { SupliersModule } from '@/modules/supliers/supliers.module';
import { DetailsModule } from '@/modules/details/details.module';
import { ServicesModule } from '@/modules/services/services.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { VehicleHistoryModule } from '@/modules/vehicle-history/vehicle-history.module';
import { UploadModule } from '@/modules/upload/upload.module';
import { ReportModule } from '@/modules/report/report.module';
import { InvoiceModule } from '@/modules/invoice/invoice.module';

const isProduction = process.env.NODE_ENV === 'production';
/** Vercel / production: no writable `src/schema.gql` — keep schema in memory. */
const graphQLSchemaInMemory = isProduction || process.env.VERCEL === '1';

@Module({
  imports: [
    HttpModule,

    // Rate limiting: 200 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 200 }]),

    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NOVA_POSHTA_API_KEY: Joi.string().required(),
        DATABASE_URL: Joi.string().uri().required(),
        SUPABASE_JWT_SECRET: Joi.string().optional(),
        SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
        SUPABASE_URL: Joi.string().uri().required(),
        ALLOWED_ORIGINS: Joi.string().optional(),
        PORT: Joi.number().integer().default(3000),
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
      }),
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: graphQLSchemaInMemory
        ? true
        : join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      // Disable introspection in production — prevents API schema enumeration
      introspection: !isProduction,
      plugins: isProduction ? [] : [ApolloServerPluginLandingPageLocalDefault()],
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),

    PrismaModule,
    HealthModule,
    AuthModule,
    UserModule,
    CompanyModule,
    ClientModule,
    VehicleModule,
    NovaPoshtaModule,
    StorageModule,
    CategoriesModule,
    SupliersModule,
    DetailsModule,
    ServicesModule,
    TasksModule,
    VehicleHistoryModule,
    UploadModule,
    ReportModule,
    InvoiceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply rate limiting globally
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
