import { Module } from '@nestjs/common';
import { StorageModule } from '@/modules/storage/storage.module';
import { DetailsResolver, DetailHistoryResolver } from './details.resolver';
import { DetailsService } from './details.service';

@Module({
  imports: [StorageModule],
  providers: [DetailsResolver, DetailHistoryResolver, DetailsService],
})
export class DetailsModule {}
