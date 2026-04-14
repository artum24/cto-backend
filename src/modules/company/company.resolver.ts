import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Company } from '@/modules/company/models/company.model';
import { CompanyService } from '@/modules/company/company.service';
import { AllowUnregisteredAppUser } from '@/auth/allow-unregistered-app-user.decorator';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { CompanyMemberUnion } from '@/modules/company/company-member.union';
import { CompanyInput } from '@/modules/company/inputs/company.input';
import { UpdateCompanyInput } from '@/modules/company/inputs/update-company.input';
import { InvitationCreateInput } from '@/modules/company/inputs/invitation-create.input';
import { UserRoles } from '@/modules/user/enums/user-roles.enum';
import { InvitationCreateOutput } from '@/modules/company/models/invitation-create.output';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(SupabaseAuthGuard)
  @Query(() => Company, { name: 'currentUserCompany' })
  currentUserCompany(@CurrentUser() current?: AuthContextUser) {
    const u = current?.user;
    if (!u?.company_id) return null;
    return this.companyService.findById(BigInt(u.company_id));
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [CompanyMemberUnion], { name: 'companyMembers' })
  companyMembers(@CurrentUser() current?: AuthContextUser) {
    const u = current?.user;
    if (!u?.company_id) return null;
    return this.companyService.findCompanyMembers(BigInt(u.company_id));
  }

  @AllowUnregisteredAppUser()
  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Company, { name: 'createCompany' })
  async createCompany(
    @Args('companyInput') companyInput: CompanyInput,
    @CurrentUser() currentUser: AuthContextUser,
  ) {
    const result = await this.companyService.create(companyInput, currentUser);
    return result.company;
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Company, { name: 'updateCompany' })
  async updateCompany(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: UpdateCompanyInput,
  ) {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    return this.companyService.update(BigInt(u.company_id), input);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => InvitationCreateOutput, { name: 'invitationCreate' })
  async invitationCreate(
    @CurrentUser() current: AuthContextUser,
    @Args('input') input: InvitationCreateInput,
  ): Promise<InvitationCreateOutput> {
    const u = current.user;
    if (!u?.company_id) {
      throw new Error('User is not associated with a company.');
    }
    if (u.role !== UserRoles.ADMIN) {
      throw new Error('You have no permission for inviting users.');
    }
    await this.companyService.inviteMember(BigInt(u.company_id), input.email);
    return { message: 'Invitation sent', error: null };
  }
}
