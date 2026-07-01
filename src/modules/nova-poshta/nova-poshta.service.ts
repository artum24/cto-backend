import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map } from 'rxjs';
import { NovaPoshtaCity } from '@/modules/nova-poshta/models/nova-poshta-city.model';
import { NovaPoshtaAddress } from '@/modules/nova-poshta/models/nova-poshta-address.model';

@Injectable()
export class NovaPoshtaService {
  private readonly apiUrl = 'https://api.novaposhta.ua/v2.0/json/';
  private readonly apiKey: string;

  private static readonly TTL = 24 * 60 * 60 * 1000; // 24h in ms

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    this.apiKey = this.configService.get<string>('NOVA_POSHTA_API_KEY')!;
  }

  async getCities(searchTerm: string): Promise<NovaPoshtaCity[]> {
    const key = `np:cities:${searchTerm.toLowerCase()}`;
    const cached = await this.cache.get<NovaPoshtaCity[]>(key);
    if (cached) return cached;

    const response = await firstValueFrom(
      this.httpService
        .post(this.apiUrl, {
          apiKey: this.apiKey,
          modelName: 'Address',
          calledMethod: 'getCities',
          methodProperties: { FindByString: searchTerm },
        })
        .pipe(map((resp) => resp.data)),
    );

    if (response.success && response.data) {
      const result = response.data.map((city: any) => ({
        name: `${city.Description} (${city.AreaDescription})`,
        ref: city.Ref,
      }));
      await this.cache.set(key, result, NovaPoshtaService.TTL);
      return result;
    }
    return [];
  }

  async getAddresses(streetName: string, cityRef: string): Promise<NovaPoshtaAddress[]> {
    const key = `np:addresses:${cityRef}:${streetName.toLowerCase()}`;
    const cached = await this.cache.get<NovaPoshtaAddress[]>(key);
    if (cached) return cached;

    const response = await firstValueFrom(
      this.httpService
        .post(this.apiUrl, {
          apiKey: this.apiKey,
          modelName: 'AddressGeneral',
          calledMethod: 'getStreet',
          methodProperties: {
            FindByString: streetName,
            CityRef: cityRef,
          },
        })
        .pipe(map((resp) => resp.data)),
    );

    if (response.success && response.data) {
      const result = response.data.map((address: any) => ({
        name: `${address.StreetsType} ${address.Description}`,
        ref: address.Ref,
      }));
      await this.cache.set(key, result, NovaPoshtaService.TTL);
      return result;
    }
    return [];
  }
}
