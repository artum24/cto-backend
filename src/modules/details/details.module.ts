import { Module } from '@nestjs/common';
import { StorageModule } from '@/modules/storage/storage.module';
import { DetailsResolver } from './details.resolver';
import { DetailsService } from './details.service';

@Module({
  imports: [StorageModule],
  providers: [DetailsResolver, DetailsService],
})
export class DetailsModule {}
