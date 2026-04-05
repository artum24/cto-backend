import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { VehicleHistoryResolver } from './vehicle-history.resolver';
import { VehicleHistoryService } from './vehicle-history.service';

@Module({
  imports: [PrismaModule],
  providers: [VehicleHistoryResolver, VehicleHistoryService],
  exports: [VehicleHistoryService],
})
export class VehicleHistoryModule {}
