import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NovaPoshtaService } from '@/modules/nova-poshta/nova-poshta.service';
import { NovaPoshtaResolver } from '@/modules/nova-poshta/nova-poshta.resolver';

@Module({
  imports: [HttpModule],
  providers: [NovaPoshtaService, NovaPoshtaResolver],
})
export class NovaPoshtaModule {}
