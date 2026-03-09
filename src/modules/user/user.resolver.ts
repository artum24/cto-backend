import { Resolver, Query } from '@nestjs/graphql';
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
}
