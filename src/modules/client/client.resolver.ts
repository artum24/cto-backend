import {
  Args,
  ID as GraphQLID,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Mutation,
} from '@nestjs/graphql';
import { Client as ClientModel } from './models/client.model';
import { Vehicle } from '@/modules/vehicle/models/vehicle.model';
import { VehicleService } from '@/modules/vehicle/vehicle.service';
import { UseGuards } from '@nestjs/common';
import {
  type AuthContextUser,
  SupabaseAuthGuard,
} from '@/auth/supabase-auth.guard';
import { ClientService } from './client.service';
import { CurrentUser } from '@/auth/current-user.decorator';
import { PhoneValidationValues } from '@/common/enums/phone-validation-values.enum';
import { CreateClientInput } from './inputs/create-client.input';
import { CreateClientWithVehiclesInput } from './inputs/create-client-with-vehicles.input';
import { UpdateClientInput } from './inputs/update-client.input';

@Resolver(() => ClientModel)
export class ClientsResolver {
  constructor(
    private readonly vehiclesService: VehicleService,
    private readonly clientsService: ClientService,
  ) {}

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [ClientModel], { name: 'clients' })
  async clients(@CurrentUser() current?: AuthContextUser) {
    const u = current?.user;
    if (!u?.company_id) return [];
    return this.clientsService.findAll(BigInt(u.company_id));
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => ClientModel, { name: 'client' })
  async resolveClient(
    @CurrentUser() current: AuthContextUser,
    @Args('id', { type: () => GraphQLID }) clientId: string,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.clientsService.findByClientId(BigInt(u.company_id), clientId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => ClientModel, { name: 'createClient' })
  async createClient(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: CreateClientInput,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.clientsService.create(BigInt(u.company_id), input);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => ClientModel, { name: 'createClientWithVehicles' })
  async createClientWithVehicles(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: CreateClientWithVehiclesInput,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.clientsService.createWithVehicles(BigInt(u.company_id), input);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => ClientModel, { name: 'updateClient' })
  async updateClient(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: UpdateClientInput,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.clientsService.update(BigInt(u.company_id), input);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => ClientModel, { name: 'archiveClient' })
  async archiveClient(
    @CurrentUser() current: AuthContextUser,
    @Args('id', { type: () => GraphQLID }) clientId: string,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.clientsService.archive(BigInt(u.company_id), clientId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Boolean, { name: 'deleteClient' })
  async deleteClient(
    @CurrentUser() current: AuthContextUser,
    @Args('id', { type: () => GraphQLID }) clientId: string,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.clientsService.remove(BigInt(u.company_id), clientId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => PhoneValidationValues, { name: 'validatePhone' })
  async validatePhone(
    @CurrentUser() current: AuthContextUser,
    @Args('phone') phone: string,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.clientsService.validatePhone(BigInt(u.company_id), phone);
  }

  @ResolveField(() => [Vehicle], { nullable: 'itemsAndList' })
  async vehicles(@Parent() parent: ClientModel) {
    return this.vehiclesService.findByClientId(parent.id);
  }
}
