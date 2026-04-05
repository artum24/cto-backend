import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { Task } from './models/task.model';
import { TasksService } from './tasks.service';
import { CreateTaskInput } from './inputs/create-task.input';
import { UpdateTaskInput } from './inputs/update-task.input';

@Resolver(() => Task)
@UseGuards(SupabaseAuthGuard)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  private companyId(user: AuthContextUser): bigint {
    if (!user.user.company_id) throw new Error('User is not associated with a company');
    return BigInt(user.user.company_id);
  }

  @Query(() => [Task], { name: 'tasks' })
  async getTasks(@CurrentUser() user: AuthContextUser) {
    return this.tasksService.findAll(this.companyId(user));
  }

  @Query(() => Task, { name: 'task' })
  async getTask(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthContextUser,
  ) {
    return this.tasksService.findOne(BigInt(id), this.companyId(user));
  }

  @Mutation(() => Task, { name: 'taskCreate' })
  async createTask(
    @Args('input') input: CreateTaskInput,
    @CurrentUser() user: AuthContextUser,
  ) {
    return this.tasksService.create(input, this.companyId(user));
  }

  @Mutation(() => Task, { name: 'taskUpdate' })
  async updateTask(
    @Args('input') input: UpdateTaskInput,
    @CurrentUser() user: AuthContextUser,
  ) {
    return this.tasksService.update(input, this.companyId(user));
  }

  @Mutation(() => Task, { name: 'taskDelete' })
  async deleteTask(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthContextUser,
  ) {
    return this.tasksService.delete(BigInt(id), this.companyId(user));
  }
}
