import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { SupabaseAdminClient } from './supabase.client';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [SupabaseAuthGuard, SupabaseAdminClient],
  exports: [SupabaseAuthGuard, SupabaseAdminClient],
})
export class AuthModule {}
