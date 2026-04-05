import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { StorageService } from '@/modules/storage/storage.service';
import { Detail } from './models/detail.model';
import { DetailHistory } from './models/detail-history.model';
import { DetailsListResult } from './models/details-list.model';
import { DetailsService } from './details.service';
import { CreateDetailInput } from './inputs/create-detail.input';
import { UpdateDetailInput } from './inputs/update-detail.input';
import { DetailsListInput } from './inputs/details-list.input';
import { RecordDetailMovementInput } from './inputs/record-detail-movement.input';

@Resolver(() => Detail)
@UseGuards(SupabaseAuthGuard)
export class DetailsResolver {
  constructor(
    private readonly detailsService: DetailsService,
    private readonly storageService: StorageService,
  ) {}

  @Query(() => DetailsListResult, { name: 'details' })
  async details(
    @CurrentUser() user: AuthContextUser,
    @Args('input', { nullable: true, type: () => DetailsListInput })
    input?: DetailsListInput | null,
  ) {
    if (!user.user.company_id) {
      return { items: [], total: 0, page: 1, limit: 25 };
    }
    const storage = await this.storageService.findByCompanyId(
      BigInt(user.user.company_id),
    );
    if (!storage) {
      return { items: [], total: 0, page: 1, limit: 25 };
    }
    return this.detailsService.findAll(BigInt(storage.id), input ?? {});
  }

  @Query(() => Detail, { name: 'detail' })
  async detail(
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
    return this.detailsService.findOne(BigInt(storage.id), id);
  }

  @Mutation(() => Detail, { name: 'createDetail' })
  async createDetail(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: CreateDetailInput,
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
    return this.detailsService.create(BigInt(storage.id), input);
  }

  @Mutation(() => Detail, { name: 'updateDetail' })
  async updateDetail(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: UpdateDetailInput,
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
    return this.detailsService.update(BigInt(storage.id), input);
  }

  @Mutation(() => Detail, { name: 'archiveDetail' })
  async archiveDetail(
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
    return this.detailsService.archive(BigInt(storage.id), id);
  }

  @Query(() => [DetailHistory], { name: 'detailHistories' })
  async detailHistories(
    @CurrentUser() user: AuthContextUser,
    @Args('detailId', { nullable: true, type: () => ID }) detailId?: string | null,
    @Args('taskId', { nullable: true, type: () => ID }) taskId?: string | null,
  ) {
    if (!user.user.company_id) return [];
    const storage = await this.storageService.findByCompanyId(
      BigInt(user.user.company_id),
    );
    if (!storage) return [];
    return this.detailsService.findDetailHistories(BigInt(storage.id), {
      detailId: detailId ?? undefined,
      taskId: taskId ?? undefined,
    });
  }

  @Mutation(() => DetailHistory, { name: 'recordDetailMovement' })
  async recordDetailMovement(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: RecordDetailMovementInput,
  ) {
    if (!user.user.company_id || !user.user.id) {
      throw new Error('User is not associated with a company.');
    }
    const storage = await this.storageService.findByCompanyId(
      BigInt(user.user.company_id),
    );
    if (!storage) {
      throw new Error('Storage not found for this company.');
    }
    return this.detailsService.recordDetailMovement(
      BigInt(storage.id),
      user.user.id,
      input,
    );
  }
}
