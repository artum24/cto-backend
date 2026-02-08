import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { ClientsResolver } from './client.resolver';
import { ClientService } from './client.service';
import { VehicleModule } from '../vehicle/vehicle.module';

@Module({
  imports: [PrismaModule, AuthModule, VehicleModule],
  providers: [ClientsResolver, ClientService],
})
export class ClientModule {}
