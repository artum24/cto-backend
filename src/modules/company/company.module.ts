import { Module } from '@nestjs/common';
import { CompanyResolver } from '@/modules/company/company.resolver';
import { InvitationResolver } from '@/modules/company/invitation.resolver';
import { CompanyService } from '@/modules/company/company.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [CompanyResolver, InvitationResolver, CompanyService],
})
export class CompanyModule {}
