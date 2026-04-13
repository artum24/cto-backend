import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { StorageService } from '@/modules/storage/storage.service';
import { Detail } from './models/detail.model';
import { DetailHistory } from './models/detail-history.model';
import { DetailHistoryUser } from './models/detail-history-user.model';
import { DetailsListResult } from './models/details-list.model';
import { DetailsService } from './details.service';
import { PrismaService } from '@/prisma/prisma.service';
import { SupabaseAdminClient } from '@/auth/supabase.client';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { Category } from '@/modules/categories/models/category.model';
import { Suplier } from '@/modules/supliers/models/suplier.model';
import { CreateDetailInput } from './inputs/create-detail.input';
import { UpdateDetailInput } from './inputs/update-detail.input';
import { DetailsListInput } from './inputs/details-list.input';
import { RecordDetailMovementInput } from './inputs/record-detail-movement.input';
import { DetailStatuses } from './enums/detail-statuses.enum';

@Resolver(() => Detail)
@UseGuards(SupabaseAuthGuard)
export class DetailsResolver {
  constructor(
    private readonly detailsService: DetailsService,
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  @ResolveField(() => DetailStatuses, { nullable: true })
  status(@Parent() detail: Detail): DetailStatuses | null {
    const count = detail.count ?? 0;
    const min = detail.minimum_count ?? 0;
    if (count === 0) return DetailStatuses.OUT_OF_STOCK;
    if (count > min) return DetailStatuses.IN_STOCK;
    return DetailStatuses.LOW_STOCK;
  }

  @ResolveField(() => Category, { nullable: true })
  async category(@Parent() detail: Detail): Promise<Category | null> {
    if (!detail.category_id) {
      return null;
    }
    const id = BigInt(detail.category_id);
    const storageId = BigInt(detail.storage_id);
    const row = await this.prisma.categories.findUnique({
      where: { id },
    });
    if (!row || row.storage_id !== storageId) {
      return null;
    }
    return bigintToString(row) as unknown as Category;
  }

  @ResolveField(() => Suplier, { nullable: true })
  async suplier(@Parent() detail: Detail): Promise<Suplier | null> {
    if (!detail.suplier_id) {
      return null;
    }
    const id = BigInt(detail.suplier_id);
    const storageId = BigInt(detail.storage_id);
    const row = await this.prisma.supliers.findUnique({
      where: { id },
    });
    if (!row || row.storage_id !== storageId) {
      return null;
    }
    return bigintToString(row) as unknown as Suplier;
  }

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

  @Mutation(() => Boolean, { name: 'deleteDetail' })
  async deleteDetail(
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
    return this.detailsService.remove(BigInt(storage.id), id);
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

  @Mutation(() => Detail, { name: 'detailCountUpdate' })
  async detailCountUpdate(
    @CurrentUser() user: AuthContextUser,
    @Args('id') id: string,
    @Args('count', { type: () => Int }) count: number,
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
    return this.detailsService.detailCountUpdate(
      BigInt(storage.id),
      user.user.id,
      id,
      count,
    );
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

@Resolver(() => DetailHistory)
export class DetailHistoryResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminClient,
  ) {}

  @ResolveField(() => DetailHistoryUser, { nullable: true })
  async user(@Parent() history: DetailHistory): Promise<DetailHistoryUser | null> {
    if (!history.user_id) return null;
    const row = await this.prisma.users.findUnique({
      where: { id: history.user_id },
      select: { id: true, email: true, auth_user_id: true },
    });
    if (!row) return null;

    let fullName: string | null = null;
    if (row.auth_user_id) {
      const { data } = await this.supabaseAdmin.client.auth.admin.getUserById(
        row.auth_user_id,
      );
      const meta = data?.user?.user_metadata as Record<string, unknown> | undefined;
      const raw = meta?.['full_name'] ?? meta?.['name'] ?? meta?.['display_name'];
      fullName = typeof raw === 'string' && raw.trim() ? raw.trim() : null;
    }

    return { id: row.id, email: row.email ?? null, fullName };
  }
}
