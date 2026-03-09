import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Company } from '@/modules/company/models/company.model';
import { CompanyService } from '@/modules/company/company.service';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { CompanyMemberUnion } from '@/modules/company/company-member.union';
import { CompanyInput } from '@/modules/company/inputs/company.input';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(SupabaseAuthGuard)
  @Query(() => Company, { name: 'currentUserCompany' })
  currentUserCompany(@CurrentUser() current?: AuthContextUser) {
    if (!current?.user?.company_id) return null;
    return this.companyService.findById(BigInt(current.user.company_id));
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [CompanyMemberUnion], { name: 'companyMembers' })
  companyMembers(@CurrentUser() current?: AuthContextUser) {
    if (!current?.user?.company_id) return null;
    return this.companyService.findCompanyMembers(
      BigInt(current.user.company_id),
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Company)
  async createCompany(
    @Args('companyInput') companyInput: CompanyInput,
    @CurrentUser() currentUser: AuthContextUser,
  ) {
    return this.companyService.create(companyInput, currentUser);
  }
}
