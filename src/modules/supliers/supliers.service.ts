import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CreateSuplierInput } from './inputs/create-suplier.input';
import { UpdateSuplierInput } from './inputs/update-suplier.input';

@Injectable()
export class SupliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storageId: bigint, archived?: boolean | null) {
    const list = await this.prisma.supliers.findMany({
      where: {
        storage_id: storageId,
        archived: archived === true,
      },
    });
    return list.map(bigintToString);
  }

  async create(storageId: bigint, input: CreateSuplierInput) {
    const now = new Date();
    const row = await this.prisma.supliers.create({
      data: {
        storage_id: storageId,
        name: input.name ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        site_url: input.siteUrl ?? null,
        comment: input.comment ?? null,
        suplier_name: input.suplierName ?? null,
        created_at: now,
        updated_at: now,
      },
    });
    return bigintToString(row);
  }

  async update(storageId: bigint, input: UpdateSuplierInput) {
    const id = BigInt(input.id);
    const existing = await this.prisma.supliers.findFirst({
      where: { id, storage_id: storageId },
    });
    if (!existing) {
      throw new NotFoundException('Suplier not found in this storage.');
    }
    const data: Prisma.supliersUpdateInput = { updated_at: new Date() };
    if (input.name !== undefined) data.name = input.name ?? null;
    if (input.phone !== undefined) data.phone = input.phone ?? null;
    if (input.email !== undefined) data.email = input.email ?? null;
    if (input.siteUrl !== undefined) data.site_url = input.siteUrl ?? null;
    if (input.comment !== undefined) data.comment = input.comment ?? null;
    if (input.suplierName !== undefined)
      data.suplier_name = input.suplierName ?? null;

    const row = await this.prisma.supliers.update({
      where: { id },
      data,
    });
    return bigintToString(row);
  }

  async archive(storageId: bigint, id: string) {
    const idBigInt = BigInt(id);
    const existing = await this.prisma.supliers.findFirst({
      where: { id: idBigInt, storage_id: storageId },
    });
    if (!existing) {
      throw new NotFoundException('Suplier not found in this storage.');
    }
    const now = new Date();
    const row = await this.prisma.supliers.update({
      where: { id: idBigInt },
      data: { archived: true, archived_at: now, updated_at: now },
    });
    return bigintToString(row);
  }

  async remove(storageId: bigint, id: string): Promise<boolean> {
    const idBigInt = BigInt(id);
    const existing = await this.prisma.supliers.findFirst({
      where: { id: idBigInt, storage_id: storageId },
    });
    if (!existing) {
      throw new NotFoundException('Suplier not found in this storage.');
    }
    const detailsCount = await this.prisma.details.count({
      where: { suplier_id: idBigInt },
    });
    if (detailsCount > 0) {
      throw new ConflictException(
        `Cannot delete supplier: ${detailsCount} detail(s) still reference it. Unlink or reassign details first, or use archiveSuplier.`,
      );
    }
    await this.prisma.supliers.delete({ where: { id: idBigInt } });
    return true;
  }
}
