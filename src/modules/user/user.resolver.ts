import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '@/auth/current-user.decorator';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { User } from '@/modules/user/models/user.model';
import { UserService } from '@/modules/user/user.service';
import { Invitation } from '@/modules/company/models/invitation.model';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

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
