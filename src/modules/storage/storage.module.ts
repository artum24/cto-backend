import { Module } from '@nestjs/common';
import { StorageResolver } from './storage.resolver';
import { StorageService } from './storage.service';

@Module({
  providers: [StorageResolver, StorageService],
})
export class StorageModule {}
