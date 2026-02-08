import { Module } from '@nestjs/common';
import { CompanyResolver } from './company.resolver';
import { CompanyService } from './company.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [CompanyResolver, CompanyService],
})
export class CompanyModule {}
