import {Args, Int, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';
import { Client } from './models/client.model';
import { Vehicle } from '../vehicle/models/vehicle.model';
import { VehicleService } from '../vehicle/vehicle.service';
import { UseGuards } from '@nestjs/common';
import {
  type AuthContextUser,
  SupabaseAuthGuard,
} from '../../auth/supabase-auth.guard';
import { ClientService } from './client.service';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => Client)
export class ClientsResolver {
  constructor(
    private readonly vehiclesService: VehicleService,
    private readonly clientsService: ClientService,
  ) {}

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [Client], { name: 'clients' })
  async clients(@CurrentUser() current?: AuthContextUser) {
    if (!current?.user?.company_id) return [];
    return this.clientsService.findAll(BigInt(current.user.company_id));
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => Client, { name: 'client' })
  async client(@CurrentUser() current?: AuthContextUser, @Args('id', { type: () => Int }) id?: number) {
    if (!current?.user?.company_id) return [];
    return this.clientsService.findByClientId(BigInt(current.user.company_id), id as number);
  }

  @ResolveField(() => [Vehicle], { nullable: 'itemsAndList' })
  async vehicles(@Parent() client: Client) {
      return this.vehiclesService.findByClientId(client.id);
  }
}
