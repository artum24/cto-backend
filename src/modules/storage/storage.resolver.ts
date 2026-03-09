import { Query, Resolver } from '@nestjs/graphql';
import { Storage } from './models/storage.model';
import { StorageService } from './storage.service';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard, AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';

@Resolver(() => Storage)
export class StorageResolver {
  constructor(private readonly storageService: StorageService) {}

  @Query(() => Storage, { name: 'storage', nullable: true })
  @UseGuards(SupabaseAuthGuard)
  async getStorageForCompany(@CurrentUser() user: AuthContextUser) {
    if (!user.user.company_id) {
      return null;
    }
    return this.storageService.findByCompanyId(BigInt(user.user.company_id));
  }
}
