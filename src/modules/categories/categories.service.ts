import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CreateCategoryInput } from './inputs/create-category.input';
import { UpdateCategoryInput } from './inputs/update-category.input';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storageId: bigint, archived?: boolean) {
    const where: Prisma.categoriesWhereInput = { storage_id: storageId };
    if (typeof archived === 'boolean') {
      where.archived = archived;
    }
    const categories = await this.prisma.categories.findMany({ where });
    return categories.map(bigintToString);
  }

  async create(input: CreateCategoryInput, storageId: bigint) {
    const newCategory = await this.prisma.categories.create({
      data: {
        name: input.name,
        storage_id: storageId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return bigintToString(newCategory);
  }

  async update(input: UpdateCategoryInput, storageId: bigint) {
    const category = await this.prisma.categories.findUnique({
      where: { id: BigInt(input.id) },
    });

    if (!category || category.storage_id !== storageId) {
      throw new Error('Category not found in this storage');
    }

    const updatedCategory = await this.prisma.categories.update({
      where: { id: BigInt(input.id) },
      data: { name: input.name },
    });

    return bigintToString(updatedCategory);
  }

  async archive(categoryId: bigint, storageId: bigint) {
    const category = await this.prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.storage_id !== storageId) {
      throw new Error('Category not found in this storage');
    }

    const updatedCategory = await this.prisma.categories.update({
      where: { id: categoryId },
      data: { archived: !category.archived },
    });

    return bigintToString(updatedCategory);
  }

  async remove(categoryId: bigint, storageId: bigint): Promise<boolean> {
    const category = await this.prisma.categories.findUnique({
      where: { id: categoryId },
    });
    if (!category || category.storage_id !== storageId) {
      throw new Error('Category not found in this storage');
    }
    const detailsCount = await this.prisma.details.count({
      where: { category_id: categoryId },
    });
    if (detailsCount > 0) {
      throw new Error(
        `Cannot delete category: ${detailsCount} detail(s) still reference it.`,
      );
    }
    await this.prisma.categories.delete({ where: { id: categoryId } });
    return true;
  }
}
