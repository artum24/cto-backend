import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CreateDetailInput } from './inputs/create-detail.input';
import { UpdateDetailInput } from './inputs/update-detail.input';
import { DetailsListInput } from './inputs/details-list.input';
import { RecordDetailMovementInput } from './inputs/record-detail-movement.input';
import { DetailStatuses } from './enums/detail-statuses.enum';

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
    const cat = await this.prisma.categories.findUnique({
      where: { id: categoryId },
    });
    if (!cat || cat.storage_id !== storageId) {
      throw new Error('Category not found in this storage.');
    }
  }

  private async ensureSuplierInStorage(
    suplierId: bigint,
    storageId: bigint,
  ): Promise<void> {
    const sup = await this.prisma.supliers.findUnique({
      where: { id: suplierId },
    });
    if (!sup || sup.storage_id !== storageId) {
      throw new Error('Suplier not found in this storage.');
    }
  }

  async findAll(storageId: bigint, input: DetailsListInput) {
    await this.ensureStorageAccess(storageId);
    const {
      categoryId,
      suplierId,
      status,
      archived = false,
      search,
      page = 1,
      limit = 25,
    } = input;

    const where: Prisma.detailsWhereInput = {
      storage_id: storageId,
      archived: archived ?? false,
    };

    if (categoryId) {
      where.category_id = BigInt(categoryId);
    }

    if (suplierId) {
      where.suplier_id = BigInt(suplierId);
    }

    // Status filter requires column-to-column comparison (count vs minimum_count)
    // For OUT_OF_STOCK we use Prisma directly; for others we resolve matching IDs via raw SQL
    if (status === DetailStatuses.OUT_OF_STOCK) {
      where.count = { equals: 0 };
    } else if (status === DetailStatuses.LOW_STOCK || status === DetailStatuses.IN_STOCK) {
      const archivedVal = archived ?? false;
      const catCondition = categoryId
        ? Prisma.sql`AND category_id = ${BigInt(categoryId)}`
        : Prisma.sql``;
      const supCondition = suplierId
        ? Prisma.sql`AND suplier_id = ${BigInt(suplierId)}`
        : Prisma.sql``;
      const statusCondition =
        status === DetailStatuses.LOW_STOCK
          ? Prisma.sql`count > 0 AND count <= minimum_count`
          : Prisma.sql`count > minimum_count`;

      const matchingIds = await this.prisma.$queryRaw<{ id: bigint }[]>(
        Prisma.sql`
          SELECT id FROM details
          WHERE storage_id = ${storageId}
            AND archived = ${archivedVal}
            ${catCondition}
            ${supCondition}
            AND ${statusCondition}
        `,
      );

      where.id = { in: matchingIds.map((r) => r.id) };
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
    if (input.categoryId != null && input.categoryId !== '') {
      await this.ensureCategoryInStorage(
        BigInt(input.categoryId),
        storageId,
      );
    }
    if (input.suplierId != null && input.suplierId !== '') {
      await this.ensureSuplierInStorage(BigInt(input.suplierId), storageId);
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
        minimum_count: input.minimumCount ?? null,
        sell_price: input.sellPrice != null ? input.sellPrice : null,
        buy_price: input.buyPrice != null ? input.buyPrice : null,
        category_id:
          input.categoryId != null && input.categoryId !== ''
            ? BigInt(input.categoryId)
            : null,
        suplier_id:
          input.suplierId != null && input.suplierId !== ''
            ? BigInt(input.suplierId)
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
    if (input.categoryId !== undefined) {
      if (input.categoryId != null && input.categoryId !== '') {
        await this.ensureCategoryInStorage(
          BigInt(input.categoryId),
          storageId,
        );
      }
    }
    if (input.suplierId !== undefined) {
      if (input.suplierId != null && input.suplierId !== '') {
        await this.ensureSuplierInStorage(
          BigInt(input.suplierId),
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
    if (input.minimumCount !== undefined)
      data.minimum_count = input.minimumCount ?? null;
    if (input.sellPrice !== undefined)
      data.sell_price = input.sellPrice != null ? input.sellPrice : null;
    if (input.buyPrice !== undefined)
      data.buy_price = input.buyPrice != null ? input.buyPrice : null;
    if (input.categoryId !== undefined) {
      data.categories =
        input.categoryId != null && input.categoryId !== ''
          ? { connect: { id: BigInt(input.categoryId) } }
          : { disconnect: true };
    }
    if (input.suplierId !== undefined)
      data.supliers =
        input.suplierId != null && input.suplierId !== ''
          ? { connect: { id: BigInt(input.suplierId) } }
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

  async remove(storageId: bigint, id: string): Promise<boolean> {
    await this.ensureStorageAccess(storageId);
    const idBigInt = BigInt(id);
    const existing = await this.prisma.details.findFirst({
      where: { id: idBigInt, storage_id: storageId },
    });
    if (!existing) {
      throw new Error('Detail not found in this storage.');
    }
    await this.prisma.$transaction(async (tx: PrismaClient) => {
      await tx.detail_histories.deleteMany({ where: { detail_id: idBigInt } });
      await tx.details.delete({ where: { id: idBigInt } });
    });
    return true;
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

  async detailCountUpdate(
    storageId: bigint,
    userId: string,
    id: string,
    newCount: number,
  ) {
    await this.ensureStorageAccess(storageId);
    const detailId = BigInt(id);
    const detail = await this.prisma.details.findFirst({
      where: { id: detailId, storage_id: storageId },
    });
    if (!detail) throw new Error('Detail not found in this storage.');

    const currentCount = detail.count ?? 0;
    const countDiff = Math.abs(currentCount - newCount);
    const now = new Date();

    const updatedDetail = await this.prisma.$transaction(async (tx: PrismaClient) => {
      const updated = await tx.details.update({
        where: { id: detailId },
        data: { count: newCount, updated_at: now },
      });
      await tx.detail_histories.create({
        data: {
          detail_id: detailId,
          storage_id: storageId,
          user_id: userId,
          action_type: 3, // correction
          count_diff: countDiff,
          count_result: newCount,
          comment: 'Зміна кількості',
          task_id: null,
          created_at: now,
          updated_at: now,
        },
      });
      return updated;
    });

    return bigintToString(updatedDetail);
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
