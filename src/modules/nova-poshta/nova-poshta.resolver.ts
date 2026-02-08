import { Args, Query, Resolver } from '@nestjs/graphql';
import { NovaPoshtaService } from './nova-poshta.service';
import { NovaPoshtaCity } from './models/nova-poshta-city.model';
import { NovaPoshtaAddress } from './models/nova-poshta-address.model';

@Resolver()
export class NovaPoshtaResolver {
  constructor(private readonly novaPoshtaService: NovaPoshtaService) {}

  @Query(() => [NovaPoshtaCity], { name: 'getNpCity' })
  async getNpCity(@Args('searchTerm') searchTerm: string) {
    return this.novaPoshtaService.getCities(searchTerm);
  }

  @Query(() => [NovaPoshtaAddress], { name: 'getNpAddress' })
  async getNpAddress(
    @Args('streetName') streetName: string,
    @Args('cityRef') cityRef: string,
  ) {
    return this.novaPoshtaService.getAddresses(streetName, cityRef);
  }
}
