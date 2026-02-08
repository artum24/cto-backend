import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { VehicleResolver } from './vehicle.resolver';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [VehicleResolver, VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
