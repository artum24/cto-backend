import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NovaPoshtaService } from './nova-poshta.service';
import { NovaPoshtaResolver } from './nova-poshta.resolver';

@Module({
  imports: [HttpModule],
  providers: [NovaPoshtaService, NovaPoshtaResolver],
})
export class NovaPoshtaModule {}
