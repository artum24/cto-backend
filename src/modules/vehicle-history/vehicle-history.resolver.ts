import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { VehicleHistory } from './models/vehicle-history.model';
import { VehicleHistoryService } from './vehicle-history.service';
import { CreateVehicleHistoryInput } from './inputs/create-vehicle-history.input';
import { UpdateVehicleHistoryInput } from './inputs/update-vehicle-history.input';

@Resolver(() => VehicleHistory)
@UseGuards(SupabaseAuthGuard)
export class VehicleHistoryResolver {
  constructor(private readonly vehicleHistoryService: VehicleHistoryService) {}

  @Query(() => [VehicleHistory], { name: 'vehicleHistories' })
  async getVehicleHistories(@CurrentUser() user: AuthContextUser) {
    const companyId = BigInt(user.user!.company_id!);
    return this.vehicleHistoryService.findAll(companyId);
  }

  @Query(() => VehicleHistory, { name: 'vehicleHistory' })
  async getVehicleHistory(
    @CurrentUser() user: AuthContextUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const companyId = BigInt(user.user!.company_id!);
    return this.vehicleHistoryService.findOne(BigInt(id), companyId);
  }

  @Mutation(() => VehicleHistory, { name: 'vehicleHistoryCreate' })
  async createVehicleHistory(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: CreateVehicleHistoryInput,
  ) {
    const companyId = BigInt(user.user!.company_id!);
    return this.vehicleHistoryService.create(input, companyId);
  }

  @Mutation(() => VehicleHistory, { name: 'vehicleHistoryUpdate' })
  async updateVehicleHistory(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: UpdateVehicleHistoryInput,
  ) {
    const companyId = BigInt(user.user!.company_id!);
    return this.vehicleHistoryService.update(input, companyId);
  }

  @Mutation(() => VehicleHistory, { name: 'vehicleHistoryDelete' })
  async deleteVehicleHistory(
    @CurrentUser() user: AuthContextUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const companyId = BigInt(user.user!.company_id!);
    return this.vehicleHistoryService.delete(BigInt(id), companyId);
  }
}
