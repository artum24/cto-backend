import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { Service } from './models/service.model';
import { ServicesService } from './services.service';
import { CreateServiceInput } from './inputs/create-service.input';
import { UpdateServiceInput } from './inputs/update-service.input';

@Resolver(() => Service)
@UseGuards(SupabaseAuthGuard)
export class ServicesResolver {
  constructor(private readonly servicesService: ServicesService) {}

  @Query(() => [Service], { name: 'services' })
  async getServices(@CurrentUser() user: AuthContextUser) {
    const companyId = BigInt(user.user!.company_id!);
    return this.servicesService.findAll(companyId);
  }

  @Query(() => Service, { name: 'service' })
  async getService(
    @CurrentUser() user: AuthContextUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const companyId = BigInt(user.user!.company_id!);
    return this.servicesService.findOne(BigInt(id), companyId);
  }

  @Mutation(() => Service, { name: 'serviceCreate' })
  async createService(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: CreateServiceInput,
  ) {
    const companyId = BigInt(user.user!.company_id!);
    return this.servicesService.create(input, companyId);
  }

  @Mutation(() => Service, { name: 'serviceUpdate' })
  async updateService(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: UpdateServiceInput,
  ) {
    const companyId = BigInt(user.user!.company_id!);
    return this.servicesService.update(input, companyId);
  }

  @Mutation(() => Service, { name: 'serviceDelete' })
  async deleteService(
    @CurrentUser() user: AuthContextUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const companyId = BigInt(user.user!.company_id!);
    return this.servicesService.delete(BigInt(id), companyId);
  }
}
