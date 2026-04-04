import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { StorageService } from '@/modules/storage/storage.service';
import { Suplier } from './models/suplier.model';
import { SupliersService } from './supliers.service';
import { CreateSuplierInput } from './inputs/create-suplier.input';
import { UpdateSuplierInput } from './inputs/update-suplier.input';

@Resolver(() => Suplier)
@UseGuards(SupabaseAuthGuard)
export class SupliersResolver {
  constructor(
    private readonly supliersService: SupliersService,
    private readonly storageService: StorageService,
  ) {}

  @Query(() => [Suplier], { name: 'supliers' })
  async supliers(@CurrentUser() user: AuthContextUser) {
    if (!user.user.company_id) return [];
    const storage = await this.storageService.findByCompanyId(
      BigInt(user.user.company_id),
    );
    if (!storage) return [];
    return this.supliersService.findAll(BigInt(storage.id));
  }

  @Mutation(() => Suplier, { name: 'createSuplier' })
  async createSuplier(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: CreateSuplierInput,
  ) {
    if (!user.user.company_id) {
      throw new Error('User is not associated with a company.');
    }
    const storage = await this.storageService.findByCompanyId(
      BigInt(user.user.company_id),
    );
    if (!storage) {
      throw new Error('Storage not found for this company.');
    }
    return this.supliersService.create(BigInt(storage.id), input);
  }

  @Mutation(() => Suplier, { name: 'updateSuplier' })
  async updateSuplier(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: UpdateSuplierInput,
  ) {
    if (!user.user.company_id) {
      throw new Error('User is not associated with a company.');
    }
    const storage = await this.storageService.findByCompanyId(
      BigInt(user.user.company_id),
    );
    if (!storage) {
      throw new Error('Storage not found for this company.');
    }
    return this.supliersService.update(BigInt(storage.id), input);
  }

  @Mutation(() => Suplier, { name: 'archiveSuplier' })
  async archiveSuplier(
    @CurrentUser() user: AuthContextUser,
    @Args('id') id: string,
  ) {
    if (!user.user.company_id) {
      throw new Error('User is not associated with a company.');
    }
    const storage = await this.storageService.findByCompanyId(
      BigInt(user.user.company_id),
    );
    if (!storage) {
      throw new Error('Storage not found for this company.');
    }
    return this.supliersService.archive(BigInt(storage.id), id);
  }
}
