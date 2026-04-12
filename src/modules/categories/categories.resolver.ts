import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Category } from './models/category.model';
import { CategoriesService } from './categories.service';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { StorageService } from '../storage/storage.service';
import { CreateCategoryInput } from './inputs/create-category.input';
import { UpdateCategoryInput } from './inputs/update-category.input';

@Resolver(() => Category)
@UseGuards(SupabaseAuthGuard)
export class CategoriesResolver {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly storageService: StorageService,
  ) {}

  @Query(() => [Category], { name: 'categories' })
  async getCategories(
    @CurrentUser() user: AuthContextUser,
    @Args('archived', { type: () => Boolean, nullable: true })
    archived?: boolean | null,
  ) {
    if (!user.user.company_id) return [];

    const storage = await this.storageService.findByCompanyId(
      BigInt(user.user.company_id),
    );
    if (!storage) return [];

    return this.categoriesService.findAll(
      BigInt(storage.id),
      typeof archived === 'boolean' ? archived : undefined,
    );
  }

  @Mutation(() => Category, { name: 'createCategory' })
  async createCategory(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: CreateCategoryInput,
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

    return this.categoriesService.create(input, BigInt(storage.id));
  }

  @Mutation(() => Category, { name: 'updateCategory' })
  async updateCategory(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: UpdateCategoryInput,
  ): Promise<Category> {
    if (!user.user.company_id) {
      throw new Error('User is not associated with a company.');
    }

    const storage = await this.storageService.findByCompanyId(
      BigInt(user.user.company_id),
    );
    if (!storage) {
      throw new Error('Storage not found for this company.');
    }

    return this.categoriesService.update(input, BigInt(storage.id)) as unknown as Promise<Category>;
  }

  @Mutation(() => Category, { name: 'archiveCategory' })
  async archiveCategory(
    @CurrentUser() user: AuthContextUser,
    @Args('id', { type: () => ID }) id: string,
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

    return this.categoriesService.archive(BigInt(id), BigInt(storage.id));
  }

  @Mutation(() => Boolean, { name: 'deleteCategory' })
  async deleteCategory(
    @CurrentUser() user: AuthContextUser,
    @Args('id', { type: () => ID }) id: string,
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

    return this.categoriesService.remove(BigInt(id), BigInt(storage.id));
  }
}
