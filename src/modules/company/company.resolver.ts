import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Company } from './models/company.model';
import { CompanyService } from './company.service';
import type { AuthContextUser } from '../../auth/supabase-auth.guard';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(SupabaseAuthGuard)
  @Query(() => Company, { name: 'myCompany' })
  myCompany(@CurrentUser() current?: AuthContextUser) {
    if (!current?.user?.company_id) return null;
    return this.companyService.findById(BigInt(current.user.company_id));
  }
}
