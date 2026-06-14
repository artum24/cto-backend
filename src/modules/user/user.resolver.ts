import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '@/auth/current-user.decorator';
import { AllowUnregisteredAppUser } from '@/auth/allow-unregistered-app-user.decorator';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { User } from '@/modules/user/models/user.model';
import { UserService } from '@/modules/user/user.service';
import { Invitation } from '@/modules/company/models/invitation.model';
import { Company } from '@/modules/company/models/company.model';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

type GqlContext = {
  supabaseAuthUserById?: Map<string, Promise<SupabaseAuthUser | null>>;
};

function extractMetaField(
  meta: Record<string, unknown> | null | undefined,
  keys: string[],
): string | null {
  if (!meta) return null;
  for (const key of keys) {
    const v = meta[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // Per-request cache to avoid duplicate Supabase calls when both
  // fullName and phone are requested for the same user in one query.
  private getCachedAuthUser(
    cache: Map<string, Promise<SupabaseAuthUser | null>> | undefined,
    authUserId: string,
  ): Promise<SupabaseAuthUser | null> {
    if (!cache) return this.userService.getAuthUserById(authUserId);
    if (!cache.has(authUserId)) {
      cache.set(authUserId, this.userService.getAuthUserById(authUserId));
    }
    return cache.get(authUserId)!;
  }

  @ResolveField(() => Company, { nullable: true })
  company(@Parent() user: { company?: Company | null }): Company | null {
    return user.company ?? null;
  }

  @ResolveField('fullName', () => String, { nullable: true })
  async resolveFullName(
    @Parent() user: { auth_user_id?: string },
    @Context() ctx: GqlContext,
  ): Promise<string | null> {
    if (!user.auth_user_id) return null;
    const authUser = await this.getCachedAuthUser(ctx.supabaseAuthUserById, user.auth_user_id);
    return extractMetaField(
      authUser?.user_metadata as Record<string, unknown> | undefined,
      ['full_name', 'name', 'display_name'],
    );
  }

  @ResolveField('phone', () => String, { nullable: true })
  async resolvePhone(
    @Parent() user: { auth_user_id?: string },
    @Context() ctx: GqlContext,
  ): Promise<string | null> {
    if (!user.auth_user_id) return null;
    const authUser = await this.getCachedAuthUser(ctx.supabaseAuthUserById, user.auth_user_id);
    return extractMetaField(
      authUser?.user_metadata as Record<string, unknown> | undefined,
      ['phone', 'phone_number'],
    );
  }

  @AllowUnregisteredAppUser()
  @UseGuards(SupabaseAuthGuard)
  @Query(() => User, { name: 'me', nullable: true })
  me(@CurrentUser() current?: AuthContextUser) {
    if (!current?.user?.id) return null;
    return this.userService.findById(current.user.id);
  }

  @AllowUnregisteredAppUser()
  @UseGuards(SupabaseAuthGuard)
  @Query(() => [Invitation], { name: 'userInvitations' })
  userInvitations(@CurrentUser() current?: AuthContextUser) {
    const email = current?.user?.email?.trim() || current?.authUser?.email?.trim();
    if (!email) return [];
    return this.userService.findUserInvitations(email);
  }

  @AllowUnregisteredAppUser()
  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => User, { name: 'acceptInvite' })
  acceptInvite(
    @CurrentUser() current: AuthContextUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.userService.acceptInvitation(id, current);
  }

  @AllowUnregisteredAppUser()
  @UseGuards(SupabaseAuthGuard)
  @Mutation(() => Boolean, { name: 'declineInvitation' })
  declineInvitation(
    @CurrentUser() current: AuthContextUser,
    @Args('invitationId') invitationId: string,
  ): Promise<boolean> {
    return this.userService.declineInvitation(invitationId, current);
  }
}
