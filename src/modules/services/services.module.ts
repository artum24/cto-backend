import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { ServicesResolver } from './services.resolver';
import { ServicesService } from './services.service';

@Module({
  imports: [PrismaModule],
  providers: [ServicesResolver, ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
