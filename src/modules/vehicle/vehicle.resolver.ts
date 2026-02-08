import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { Vehicle } from './models/vehicle.model';
import { VehicleService } from './vehicle.service';
import { UseGuards } from '@nestjs/common';
import {
  type AuthContextUser,
  SupabaseAuthGuard,
} from '../../auth/supabase-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { VehicleMake } from './models/vehicleMakes.model';
import { VehicleModel } from './models/vehicleModel.model';
import { VehiclesInput } from './inputs/vehicles.input';

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
}
