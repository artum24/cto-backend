import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { ReportResolver } from './report.resolver';
import { ReportService } from './report.service';

@Module({
  imports: [PrismaModule],
  providers: [ReportResolver, ReportService],
})
export class ReportModule {}
