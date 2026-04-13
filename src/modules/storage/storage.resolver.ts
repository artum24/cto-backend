import { Query, Resolver } from '@nestjs/graphql';
import { Storage } from './models/storage.model';
import { StorageService } from './storage.service';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';

@Resolver(() => Storage)
export class StorageResolver {
  constructor(private readonly storageService: StorageService) {}

  @Query(() => Storage, { name: 'storage', nullable: true })
  @UseGuards(SupabaseAuthGuard)
  async getStorageForCompany(@CurrentUser() user: AuthContextUser) {
    const u = user.user;
    if (!u?.company_id) {
      return null;
    }
    return this.storageService.findByCompanyId(BigInt(u.company_id));
  }
}
