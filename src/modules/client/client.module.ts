import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';
import { ClientsResolver } from '@/modules/client/client.resolver';
import { ClientService } from '@/modules/client/client.service';
import { VehicleModule } from '@/modules/vehicle/vehicle.module';

@Module({
  imports: [PrismaModule, AuthModule, VehicleModule],
  providers: [ClientsResolver, ClientService],
})
export class ClientModule {}
