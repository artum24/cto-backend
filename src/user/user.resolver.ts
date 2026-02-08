import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import * as supabaseAuthGuard from '../auth/supabase-auth.guard';
import {User} from './user.model';
import {UserService} from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {
  }

  @UseGuards(supabaseAuthGuard.SupabaseAuthGuard)
  @Query(() => User, {name: 'me'})
  async me(@CurrentUser() current?: supabaseAuthGuard.AuthContextUser) {
    if (!current?.user?.id) return null;
    return this.userService.findById(current.user.id);
  }
}
