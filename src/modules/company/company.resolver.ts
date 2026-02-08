import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Company } from './models/company.model';
import { CompanyService } from './company.service';
import type { AuthContextUser } from '../../auth/supabase-auth.guard';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { CompanyMemberUnion } from './company-member.union';
import { CompanyInput } from './inputs/company.input';
import { CompanyCreateOutput } from './models/company-create.output';

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
  @Mutation(() => CompanyCreateOutput)
  async createCompany(
    @Args('companyInput') companyInput: CompanyInput,
    @CurrentUser() currentUser: AuthContextUser,
  ) {
    return this.companyService.create(companyInput, currentUser);
  }
}
