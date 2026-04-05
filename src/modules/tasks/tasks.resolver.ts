import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { Task } from './models/task.model';
import { TasksService } from './tasks.service';
import { CreateTaskInput } from './inputs/create-task.input';
import { UpdateTaskInput } from './inputs/update-task.input';

@Resolver(() => Task)
@UseGuards(SupabaseAuthGuard)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task], { name: 'tasks' })
  async getTasks() {
    return this.tasksService.findAll();
  }

  @Query(() => Task, { name: 'task' })
  async getTask(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.findOne(BigInt(id));
  }

  @Mutation(() => Task, { name: 'taskCreate' })
  async createTask(@Args('input') input: CreateTaskInput) {
    return this.tasksService.create(input);
  }

  @Mutation(() => Task, { name: 'taskUpdate' })
  async updateTask(@Args('input') input: UpdateTaskInput) {
    return this.tasksService.update(input);
  }

  @Mutation(() => Task, { name: 'taskDelete' })
  async deleteTask(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.delete(BigInt(id));
  }
}
