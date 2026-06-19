import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NhtsaSyncService } from './nhtsa-sync.service';
import { NhtsaSyncJob } from './nhtsa-sync.job';
import { NhtsaSyncController } from './nhtsa-sync.controller';

@Module({
  imports: [HttpModule],
  providers: [NhtsaSyncService, NhtsaSyncJob],
  controllers: [NhtsaSyncController],
})
export class NhtsaModule {}
