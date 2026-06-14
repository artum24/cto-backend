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
import { UseGuards, ForbiddenException } from '@nestjs/common';
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
  clients(
    @CurrentUser() current?: AuthContextUser,
    @Args('includeArchived', { type: () => Boolean, nullable: true, defaultValue: false })
    includeArchived = false,
  ) {
    const u = current?.user;
    if (!u?.company_id) return [];
    return this.clientsService.findAll(BigInt(u.company_id), includeArchived);
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => ClientModel, { name: 'client' })
  resolveClient(
    @CurrentUser() current: AuthContextUser,
    @Args('id', { type: () => GraphQLID }) clientId: string,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new ForbiddenException('User is not associated with a company.');
    }
    return this.clientsService.findByClientId(BigInt(u.company_id), clientId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => ClientModel, { name: 'createClient' })
  createClient(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: CreateClientInput,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new ForbiddenException('User is not associated with a company.');
    }
    return this.clientsService.create(BigInt(u.company_id), input);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => ClientModel, { name: 'createClientWithVehicles' })
  createClientWithVehicles(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: CreateClientWithVehiclesInput,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new ForbiddenException('User is not associated with a company.');
    }
    return this.clientsService.createWithVehicles(BigInt(u.company_id), input);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => ClientModel, { name: 'updateClient' })
  updateClient(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: UpdateClientInput,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new ForbiddenException('User is not associated with a company.');
    }
    return this.clientsService.update(BigInt(u.company_id), input);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => ClientModel, { name: 'archiveClient' })
  archiveClient(
    @CurrentUser() current: AuthContextUser,
    @Args('id', { type: () => GraphQLID }) clientId: string,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new ForbiddenException('User is not associated with a company.');
    }
    return this.clientsService.archive(BigInt(u.company_id), clientId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Boolean, { name: 'deleteClient' })
  deleteClient(
    @CurrentUser() current: AuthContextUser,
    @Args('id', { type: () => GraphQLID }) clientId: string,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new ForbiddenException('User is not associated with a company.');
    }
    return this.clientsService.remove(BigInt(u.company_id), clientId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => PhoneValidationValues, { name: 'validatePhone' })
  validatePhone(
    @CurrentUser() current: AuthContextUser,
    @Args('phone') phone: string,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new ForbiddenException('User is not associated with a company.');
    }
    return this.clientsService.validatePhone(BigInt(u.company_id), phone);
  }

  @ResolveField(() => [Vehicle], { nullable: 'itemsAndList' })
  vehicles(@Parent() parent: ClientModel) {
    return this.vehiclesService.findByClientId(parent.id);
  }
}
