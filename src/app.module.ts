import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import Joi from 'joi';
import { Request, Response } from 'express';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { ClientModule } from './modules/client/client.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { NovaPoshtaModule } from './modules/nova-poshta/nova-poshta.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NOVA_POSHTA_API_KEY: Joi.string().required(),
        DATABASE_URL: Joi.string().uri().required(),
        SUPABASE_JWT_SECRET: Joi.string().optional(),
        SUPABASE_SERVICE_ROLE_KEY: Joi.string().optional(),
        SUPABASE_URL: Joi.string().uri().optional(),
        PORT: Joi.number().integer().default(3000),
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
