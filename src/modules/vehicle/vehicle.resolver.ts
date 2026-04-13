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
import { OrderByInput } from '@/modules/vehicle/inputs/order-by.input';
import { CreateVehicleInput } from '@/modules/vehicle/inputs/create-vehicle.input';
import { VehicleUpdateInput } from '@/modules/vehicle/inputs/vehicle-update.input';
import { FilteredVehiclesResult } from '@/modules/vehicle/models/filtered-vehicles.model';
import { VehicleUpdateOutput } from '@/modules/vehicle/models/vehicle-update.output';
import { VehicleType } from './enums/vehicle-type.enum';

@Resolver(() => Vehicle)
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [Vehicle], { name: 'vehicles' })
  async vehicles(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: VehiclesInput,
  ) {
    const u = current.user;
    if (!u?.company_id) return [];
    return this.vehicleService.findAndFilter(BigInt(u.company_id), input);
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => FilteredVehiclesResult, { name: 'filteredVehicles' })
  async filteredVehicles(
    @CurrentUser() current: AuthContextUser,
    @Args('page', { type: () => Int, nullable: true }) page?: number | null,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number | null,
    @Args('search', { type: () => String, nullable: true }) search?: string | null,
    @Args('orderBy', { type: () => OrderByInput, nullable: true }) orderBy?: OrderByInput | null,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      return { collection: [], metadata: { currentPage: 1, limitValue: 25, totalCount: 0, totalPages: 0 } };
    }
    return this.vehicleService.filteredVehicles(BigInt(u.company_id), {
      page,
      limit,
      search,
      orderBy: orderBy ?? undefined,
    });
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [VehicleMake], { name: 'vehicleMakes' })
  async vehiclesMakes(@CurrentUser() current?: AuthContextUser) {
    const u = current?.user;
    if (!u?.company_id) return [];
    return this.vehicleService.findAllMakes();
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [VehicleModel], { name: 'vehicleModels' })
  async vehiclesModels(@CurrentUser() current?: AuthContextUser) {
    const u = current?.user;
    if (!u?.company_id) return [];
    return this.vehicleService.findAllModels();
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [VehicleModel], { name: 'vehicleModelsByMake' })
  async vehiclesModelsByMake(
    @CurrentUser() current?: AuthContextUser,
    @Args('vehicleMakeId', { type: () => Int }) vehicleMakeId?: number,
    @Args('vehicleType', { type: () => VehicleType }) vehicleType?: VehicleType,
  ) {
    const u = current?.user;
    if (!u?.company_id || !vehicleMakeId || !vehicleType) return [];
    return this.vehicleService.findAllModelsByMake(vehicleMakeId, vehicleType);
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [VehicleMake], { name: 'vehicleMakesByType' })
  async vehiclesMakesByType(
    @CurrentUser() current?: AuthContextUser,
    @Args('vehicleType', { type: () => VehicleType }) vehicleType?: VehicleType,
  ) {
    const u = current?.user;
    if (!u?.company_id || !vehicleType) return [];
    return this.vehicleService.findAllMakesByType(vehicleType);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Vehicle, { name: 'createVehicle' })
  async createVehicle(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: CreateVehicleInput,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.vehicleService.create(BigInt(u.company_id), input);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => VehicleUpdateOutput, { name: 'vehicleUpdate' })
  async vehicleUpdate(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: VehicleUpdateInput,
  ): Promise<VehicleUpdateOutput> {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    const result = await this.vehicleService.update(BigInt(u.company_id), input);
    const { client, ...vehicleFields } = result as any;
    return { vehicle: vehicleFields, client };
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Vehicle, { name: 'archiveVehicle' })
  async archiveVehicle(
    @CurrentUser() current: AuthContextUser,
    @Args('id') id: string,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.vehicleService.archive(BigInt(u.company_id), id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Boolean, { name: 'deleteVehicle' })
  async deleteVehicle(
    @CurrentUser() current: AuthContextUser,
    @Args('id') id: string,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.vehicleService.remove(BigInt(u.company_id), id);
  }
}
