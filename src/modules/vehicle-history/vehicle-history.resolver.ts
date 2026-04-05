import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { VehicleHistory } from './models/vehicle-history.model';
import { VehicleHistoryService } from './vehicle-history.service';
import { CreateVehicleHistoryInput } from './inputs/create-vehicle-history.input';
import { UpdateVehicleHistoryInput } from './inputs/update-vehicle-history.input';

@Resolver(() => VehicleHistory)
@UseGuards(SupabaseAuthGuard)
export class VehicleHistoryResolver {
  constructor(private readonly vehicleHistoryService: VehicleHistoryService) {}

  @Query(() => [VehicleHistory], { name: 'vehicleHistories' })
  async getVehicleHistories() {
    return this.vehicleHistoryService.findAll();
  }

  @Query(() => VehicleHistory, { name: 'vehicleHistory' })
  async getVehicleHistory(@Args('id', { type: () => ID }) id: string) {
    return this.vehicleHistoryService.findOne(BigInt(id));
  }

  @Mutation(() => VehicleHistory, { name: 'vehicleHistoryCreate' })
  async createVehicleHistory(
    @Args('input') input: CreateVehicleHistoryInput,
  ) {
    return this.vehicleHistoryService.create(input);
  }

  @Mutation(() => VehicleHistory, { name: 'vehicleHistoryUpdate' })
  async updateVehicleHistory(
    @Args('input') input: UpdateVehicleHistoryInput,
  ) {
    return this.vehicleHistoryService.update(input);
  }

  @Mutation(() => VehicleHistory, { name: 'vehicleHistoryDelete' })
  async deleteVehicleHistory(@Args('id', { type: () => ID }) id: string) {
    return this.vehicleHistoryService.delete(BigInt(id));
  }
}
