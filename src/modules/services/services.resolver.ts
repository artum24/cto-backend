import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { Service } from './models/service.model';
import { ServicesService } from './services.service';
import { CreateServiceInput } from './inputs/create-service.input';
import { UpdateServiceInput } from './inputs/update-service.input';

@Resolver(() => Service)
@UseGuards(SupabaseAuthGuard)
export class ServicesResolver {
  constructor(private readonly servicesService: ServicesService) {}

  @Query(() => [Service], { name: 'services' })
  async getServices() {
    return this.servicesService.findAll();
  }

  @Query(() => Service, { name: 'service' })
  async getService(@Args('id', { type: () => ID }) id: string) {
    return this.servicesService.findOne(BigInt(id));
  }

  @Mutation(() => Service, { name: 'serviceCreate' })
  async createService(@Args('input') input: CreateServiceInput) {
    return this.servicesService.create(input);
  }

  @Mutation(() => Service, { name: 'serviceUpdate' })
  async updateService(@Args('input') input: UpdateServiceInput) {
    return this.servicesService.update(input);
  }

  @Mutation(() => Service, { name: 'serviceDelete' })
  async deleteService(@Args('id', { type: () => ID }) id: string) {
    return this.servicesService.delete(BigInt(id));
  }
}
