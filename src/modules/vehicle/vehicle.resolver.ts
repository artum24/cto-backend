import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Vehicle } from '@/modules/vehicle/models/vehicle.model';
import { VehicleService } from '@/modules/vehicle/vehicle.service';
import { UseGuards } from '@nestjs/common';
import {
  type AuthContextUser,
  SupabaseAuthGuard,
} from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { VehicleMake } from '@/modules/vehicle/models/vehicleMakes.model';
import { VehicleModel } from '@/modules/vehicle/models/vehicleModel.model';
import { VehiclesInput } from '@/modules/vehicle/inputs/vehicles.input';
import { CreateVehicleInput } from '@/modules/vehicle/inputs/create-vehicle.input';
import { UpdateVehicleInput } from '@/modules/vehicle/inputs/update-vehicle.input';

@Resolver(() => Vehicle)
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [Vehicle], { name: 'vehicles' })
  async vehicles(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: VehiclesInput,
  ) {
    if (!current?.user?.company_id) return [];
    return this.vehicleService.findAndFilter(
      BigInt(current.user.company_id),
      input,
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [VehicleMake], { name: 'vehicleMakes' })
  async vehiclesMakes(@CurrentUser() current?: AuthContextUser) {
    if (!current?.user?.company_id) return [];
    return this.vehicleService.findAllMakes();
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [VehicleModel], { name: 'vehicleModels' })
  async vehiclesModels(@CurrentUser() current?: AuthContextUser) {
    if (!current?.user?.company_id) return [];
    return this.vehicleService.findAllModels();
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [VehicleModel], { name: 'vehicleModelsByMake' })
  async vehiclesModelsByMake(
    @CurrentUser() current?: AuthContextUser,
    @Args('makeId', { type: () => Int }) makeId?: number,
  ) {
    if (!current?.user?.company_id || !makeId) return [];
    return this.vehicleService.findAllModelsByMake(makeId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [VehicleMake], { name: 'vehicleMakesByType' })
  async vehiclesMakesByType(
    @CurrentUser() current?: AuthContextUser,
    @Args('typeId', { type: () => Int }) typeId?: number,
  ) {
    if (!current?.user?.company_id || !typeId) return [];
    return this.vehicleService.findAllMakesByType(typeId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Vehicle, { name: 'createVehicle' })
  async createVehicle(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: CreateVehicleInput,
  ) {
    if (!current?.user?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.vehicleService.create(BigInt(current.user.company_id), input);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Vehicle, { name: 'updateVehicle' })
  async updateVehicle(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: UpdateVehicleInput,
  ) {
    if (!current?.user?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.vehicleService.update(BigInt(current.user.company_id), input);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Vehicle, { name: 'archiveVehicle' })
  async archiveVehicle(
    @CurrentUser() current: AuthContextUser,
    @Args('id') id: string,
  ) {
    if (!current?.user?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.vehicleService.archive(BigInt(current.user.company_id), id);
  }
}
