import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '@/auth/current-user.decorator';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { User } from '@/modules/user/models/user.model';
import { UserService } from '@/modules/user/user.service';
import { Invitation } from '@/modules/company/models/invitation.model';
import { Company } from '@/modules/company/models/company.model';
import { SupabaseAdminClient } from '@/auth/supabase.client';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { Request, Response } from 'express';

type GqlContext = {
  req: Request;
  res: Response;
  supabaseAuthUserById?: Map<string, Promise<SupabaseAuthUser | null>>;
};

function stringFromUserMetadata(
  meta: Record<string, unknown> | null | undefined,
  keys: string[],
): string | null {
  if (!meta) return null;
  for (const key of keys) {
    const v = meta[key];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return null;
}

async function getCachedSupabaseAuthUser(
  supabaseAdmin: SupabaseAdminClient,
  cache: Map<string, Promise<SupabaseAuthUser | null>> | undefined,
  authUserId: string,
): Promise<SupabaseAuthUser | null> {
  if (!cache) {
    const { data, error } =
      await supabaseAdmin.client.auth.admin.getUserById(authUserId);
    if (error || !data.user) return null;
    return data.user;
  }
  let pending = cache.get(authUserId);
  if (!pending) {
    pending = (async () => {
      const { data, error } =
        await supabaseAdmin.client.auth.admin.getUserById(authUserId);
      if (error || !data.user) return null;
      return data.user;
    })();
    cache.set(authUserId, pending);
  }
  return pending;
}

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly supabaseAdmin: SupabaseAdminClient,
    private readonly prisma: PrismaService,
  ) {}

  @ResolveField(() => Company)
  async company(
    @Parent()
    user: {
      company_id?: string | bigint;
      companies?: Record<string, unknown> | null;
      company?: unknown;
    },
  ): Promise<Company | null> {
    if (user.company != null) return user.company as Company;
    if (user.companies != null) {
      return bigintToString(user.companies as Record<string, unknown>) as Company;
    }
    if (user.company_id == null) return null;
    const row = await this.prisma.companies.findUnique({
      where: { id: BigInt(String(user.company_id)) },
    });
    return row ? (bigintToString(row) as unknown as Company) : null;
  }

  @ResolveField('fullName', () => String, { nullable: true })
  async resolveFullName(
    @Parent() user: { auth_user_id?: string },
    @Context() ctx: GqlContext,
  ): Promise<string | null> {
    if (!user.auth_user_id) return null;
    const authUser = await getCachedSupabaseAuthUser(
      this.supabaseAdmin,
      ctx.supabaseAuthUserById,
      user.auth_user_id,
    );
    if (!authUser) return null;
    return stringFromUserMetadata(
      authUser.user_metadata as Record<string, unknown>,
      ['full_name', 'name', 'display_name'],
    );
  }

  @ResolveField('phone', () => String, { nullable: true })
  async resolvePhone(
    @Parent() user: { auth_user_id?: string },
    @Context() ctx: GqlContext,
  ): Promise<string | null> {
    if (!user.auth_user_id) return null;
    const authUser = await getCachedSupabaseAuthUser(
      this.supabaseAdmin,
      ctx.supabaseAuthUserById,
      user.auth_user_id,
    );
    if (!authUser) return null;
    return stringFromUserMetadata(
      authUser.user_metadata as Record<string, unknown>,
      ['phone', 'phone_number'],
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => User, { name: 'me' })
  me(@CurrentUser() current?: AuthContextUser) {
    if (!current?.user?.id) return null;
    return this.userService.findById(current.user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Query(() => [Invitation], { name: 'userInvitations' })
  userInvitations(@CurrentUser() current?: AuthContextUser) {
    if (!current?.user?.email) return null;
    return this.userService.findUserInvitations(current.user.email);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => User, { name: 'acceptInvitation' })
  async acceptInvitation(
    @CurrentUser() current: AuthContextUser,
    @Args('invitationId') invitationId: string,
  ) {
    return this.userService.acceptInvitation(invitationId, current);
  }

  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Boolean, { name: 'declineInvitation' })
  async declineInvitation(
    @CurrentUser() current: AuthContextUser,
    @Args('invitationId') invitationId: string,
  ): Promise<boolean> {
    return this.userService.declineInvitation(invitationId, current);
  }
}
