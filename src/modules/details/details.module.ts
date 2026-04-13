import { Module } from '@nestjs/common';
import { StorageModule } from '@/modules/storage/storage.module';
import { AuthModule } from '@/auth/auth.module';
import { DetailsResolver, DetailHistoryResolver } from './details.resolver';
import { DetailsService } from './details.service';

@Module({
  imports: [StorageModule, AuthModule],
  providers: [DetailsResolver, DetailHistoryResolver, DetailsService],
})
export class DetailsModule {}
