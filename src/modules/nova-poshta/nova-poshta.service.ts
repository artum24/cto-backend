import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map } from 'rxjs';
import { NovaPoshtaCity } from './models/nova-poshta-city.model';
import { NovaPoshtaAddress } from './models/nova-poshta-address.model';

@Injectable()
export class NovaPoshtaService {
  private readonly apiUrl = 'https://api.novaposhta.ua/v2.0/json/';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('NOVA_POSHTA_API_KEY')!;
  }

  async getCities(searchTerm: string): Promise<NovaPoshtaCity[]> {
    const response = await firstValueFrom(
      this.httpService
        .post(this.apiUrl, {
          apiKey: this.apiKey,
          modelName: 'Address',
          calledMethod: 'getCities',
          methodProperties: {
            FindByString: searchTerm,
          },
        })
        .pipe(map((resp) => resp.data)),
    );

    if (response.success && response.data) {
      return response.data.map((city: any) => ({
        name: `${city.Description} (${city.AreaDescription})`,
        ref: city.Ref,
      }));
    }
    return [];
  }

  async getAddresses(
    streetName: string,
    cityRef: string,
  ): Promise<NovaPoshtaAddress[]> {
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
      return response.data.map((address: any) => ({
        name: `${address.StreetsType} ${address.Description}`,
        ref: address.Ref,
      }));
    }
    return [];
  }
}
