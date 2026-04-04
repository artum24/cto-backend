import { Module } from '@nestjs/common';
import { StorageModule } from '@/modules/storage/storage.module';
import { SupliersResolver } from './supliers.resolver';
import { SupliersService } from './supliers.service';

@Module({
  imports: [StorageModule],
  providers: [SupliersResolver, SupliersService],
})
export class SupliersModule {}
