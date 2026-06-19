import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import {WorkspaceService} from "@/modules/workspaces/workspace.service";
import {Workspace} from "@/modules/workspaces/models/workspaces.model";
import {CreateWorkspaceInput} from "@/modules/workspaces/inputs/create-workspace.input";
import {UpdateWorkspaceInput} from "@/modules/workspaces/inputs/update-workspace.input";

@Resolver(() => Workspace)
@UseGuards(SupabaseAuthGuard)
export class WorkspacesResolver {
  constructor(private readonly workspacesService: WorkspaceService) {}

  private companyId(user: AuthContextUser): bigint {
    const u = user.user;
    if (!u?.company_id) throw new Error('User is not associated with a company');
    return BigInt(u.company_id);
  }

  @Query(() => [Workspace], { name: 'workspaces' })
  async getWorkspaces(@CurrentUser() user: AuthContextUser) {
    return this.workspacesService.findAll(this.companyId(user));
  }

  @Mutation(() => Workspace, { name: 'workspaceCreate' })
  async createWorkspace(
    @Args('input') input: CreateWorkspaceInput,
    @CurrentUser() user: AuthContextUser,
  ) {
    return this.workspacesService.create(input, this.companyId(user));
  }

  @Mutation(() => Workspace, { name: 'workspaceUpdate' })
  async updateWorkspace(
    @Args('input') input: UpdateWorkspaceInput,
    @CurrentUser() user: AuthContextUser,
  ) {
    return this.workspacesService.update(input, this.companyId(user));
  }

  @Mutation(() => Workspace, { name: 'workspaceDelete' })
  async deleteWorkspace(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthContextUser,
  ) {
    return this.workspacesService.delete(BigInt(id), this.companyId(user));
  }
}
