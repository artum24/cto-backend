import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CreateDetailInput } from './inputs/create-detail.input';
import { UpdateDetailInput } from './inputs/update-detail.input';
import { DetailsListInput } from './inputs/details-list.input';
import { RecordDetailMovementInput } from './inputs/record-detail-movement.input';

@Injectable()
export class DetailsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureStorageAccess(storageId: bigint) {
    const storage = await this.prisma.storages.findUnique({
      where: { id: storageId },
    });
    if (!storage) throw new Error('Storage not found.');
  }

  private async ensureCategoryInStorage(
    categoryId: bigint,
    storageId: bigint,
  ): Promise<void> {
    const cat = await this.prisma.categories.findFirst({
      where: { id: categoryId, storage_id: storageId },
    });
    if (!cat) throw new Error('Category not found in this storage.');
  }

  private async ensureSuplierInStorage(
    suplierId: bigint,
    storageId: bigint,
  ): Promise<void> {
    const sup = await this.prisma.supliers.findFirst({
      where: { id: suplierId, storage_id: storageId },
    });
    if (!sup) throw new Error('Suplier not found in this storage.');
  }

  async findAll(storageId: bigint, input: DetailsListInput) {
    await this.ensureStorageAccess(storageId);
    const { categoryId, search, page = 1, limit = 25 } = input;
    const where: Prisma.detailsWhereInput = {
      storage_id: storageId,
      archived: false,
    };
    if (categoryId) {
      where.category_id = BigInt(categoryId);
    }
    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { article: { contains: term, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.details.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.details.count({ where }),
    ]);
    return {
      items: items.map(bigintToString),
      total,
      page,
      limit,
    };
  }

  async findOne(storageId: bigint, id: string) {
    await this.ensureStorageAccess(storageId);
    const idBigInt = BigInt(id);
    const detail = await this.prisma.details.findFirst({
      where: { id: idBigInt, storage_id: storageId },
    });
    if (!detail) throw new Error('Detail not found in this storage.');
    return bigintToString(detail);
  }

  async create(storageId: bigint, input: CreateDetailInput) {
    await this.ensureStorageAccess(storageId);
    if (input.category_id != null && input.category_id !== '') {
      await this.ensureCategoryInStorage(
        BigInt(input.category_id),
        storageId,
      );
    }
    if (input.suplier_id != null && input.suplier_id !== '') {
      await this.ensureSuplierInStorage(BigInt(input.suplier_id), storageId);
    }
    if (input.article != null && input.article.trim() !== '') {
      const existing = await this.prisma.details.findFirst({
        where: { article: input.article.trim() },
      });
      if (existing) {
        throw new Error('A detail with this article number already exists.');
      }
    }
    const now = new Date();
    const row = await this.prisma.details.create({
      data: {
        storage_id: storageId,
        name: input.name ?? null,
        article: input.article?.trim() || null,
        count: input.count ?? null,
        minimum_count: input.minimum_count ?? null,
        sell_price: input.sell_price != null ? input.sell_price : null,
        buy_price: input.buy_price != null ? input.buy_price : null,
        category_id:
          input.category_id != null && input.category_id !== ''
            ? BigInt(input.category_id)
            : null,
        suplier_id:
          input.suplier_id != null && input.suplier_id !== ''
            ? BigInt(input.suplier_id)
            : null,
        created_at: now,
        updated_at: now,
      },
    });
    return bigintToString(row);
  }

  async update(storageId: bigint, input: UpdateDetailInput) {
    await this.ensureStorageAccess(storageId);
    const id = BigInt(input.id);
    const existing = await this.prisma.details.findFirst({
      where: { id, storage_id: storageId },
    });
    if (!existing) throw new Error('Detail not found in this storage.');
    if (input.category_id !== undefined) {
      if (input.category_id != null && input.category_id !== '') {
        await this.ensureCategoryInStorage(
          BigInt(input.category_id),
          storageId,
        );
      }
    }
    if (input.suplier_id !== undefined) {
      if (input.suplier_id != null && input.suplier_id !== '') {
        await this.ensureSuplierInStorage(
          BigInt(input.suplier_id),
          storageId,
        );
      }
    }
    if (
      input.article != null &&
      input.article.trim() !== '' &&
      input.article.trim() !== existing.article
    ) {
      const other = await this.prisma.details.findFirst({
        where: { article: input.article.trim(), id: { not: id } },
      });
      if (other) {
        throw new Error('Another detail already has this article number.');
      }
    }
    const data: Prisma.detailsUpdateInput = { updated_at: new Date() };
    if (input.name !== undefined) data.name = input.name ?? null;
    if (input.article !== undefined)
      data.article = input.article?.trim() || null;
    if (input.count !== undefined) data.count = input.count ?? null;
    if (input.minimum_count !== undefined)
      data.minimum_count = input.minimum_count ?? null;
    if (input.sell_price !== undefined)
      data.sell_price = input.sell_price != null ? input.sell_price : null;
    if (input.buy_price !== undefined)
      data.buy_price = input.buy_price != null ? input.buy_price : null;
    if (input.category_id !== undefined) {
      data.categories =
        input.category_id != null && input.category_id !== ''
          ? { connect: { id: BigInt(input.category_id) } }
          : { disconnect: true };
    }
    if (input.suplier_id !== undefined)
      data.supliers =
        input.suplier_id != null && input.suplier_id !== ''
          ? { connect: { id: BigInt(input.suplier_id) } }
          : { disconnect: true };

    const row = await this.prisma.details.update({
      where: { id },
      data,
    });
    return bigintToString(row);
  }

  async archive(storageId: bigint, id: string) {
    await this.ensureStorageAccess(storageId);
    const idBigInt = BigInt(id);
    const existing = await this.prisma.details.findFirst({
      where: { id: idBigInt, storage_id: storageId },
    });
    if (!existing) throw new Error('Detail not found in this storage.');
    const now = new Date();
    const row = await this.prisma.details.update({
      where: { id: idBigInt },
      data: { archived: true, archived_at: now, updated_at: now },
    });
    return bigintToString(row);
  }

  async findDetailHistories(
    storageId: bigint,
    filters: { detailId?: string; taskId?: string } = {},
  ) {
    await this.ensureStorageAccess(storageId);
    const where: Prisma.detail_historiesWhereInput = { storage_id: storageId };
    if (filters.detailId) where.detail_id = BigInt(filters.detailId);
    if (filters.taskId) where.task_id = BigInt(filters.taskId);
    const list = await this.prisma.detail_histories.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 100,
    });
    return list.map(bigintToString);
  }

  async recordDetailMovement(
    storageId: bigint,
    userId: string,
    input: RecordDetailMovementInput,
  ) {
    await this.ensureStorageAccess(storageId);
    const detailId = BigInt(input.detailId);
    const detail = await this.prisma.details.findFirst({
      where: { id: detailId, storage_id: storageId },
    });
    if (!detail) throw new Error('Detail not found in this storage.');
    const currentCount = detail.count ?? 0;
    const countResult = currentCount + input.count_diff;
    if (countResult < 0) {
      throw new Error(
        'Resulting count would be negative. Current count: ' + currentCount,
      );
    }
    const now = new Date();
    const history = await this.prisma.$transaction(async (tx: PrismaClient) => {
      await tx.details.update({
        where: { id: detailId },
        data: { count: countResult, updated_at: now },
      });
      return tx.detail_histories.create({
        data: {
          detail_id: detailId,
          storage_id: storageId,
          user_id: userId,
          action_type: input.action_type,
          count_diff: input.count_diff,
          count_result: countResult,
          task_id:
            input.taskId != null && input.taskId !== ''
              ? BigInt(input.taskId)
              : null,
          comment: input.comment ?? null,
          created_at: now,
          updated_at: now,
        },
      });
    });
    return bigintToString(history);
  }
}
