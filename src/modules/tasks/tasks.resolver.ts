import {Resolver, Query, Mutation, Args, ID, Context, Subscription} from '@nestjs/graphql';
import {Inject, UseGuards} from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import {AllTasksResult, Task, TasksByDate} from './models/task.model';
import { TasksService } from './tasks.service';
import { CreateTaskInput } from './inputs/create-task.input';
import { UpdateTaskInput } from './inputs/update-task.input';
import {TasksFilterInput} from "@/modules/tasks/inputs/tasks-filter.input";
import {TASK_PUB_SUB} from "@/modules/tasks/task-pubsub.provider";
import {PubSub} from "graphql-subscriptions";
import {TaskEventsEnum} from "@/modules/tasks/enums/task-events.enum";
import {TaskDeletedPayload} from "@/modules/tasks/models/task-deleted.model";

@Resolver(() => Task)
@UseGuards(SupabaseAuthGuard)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService, @Inject(TASK_PUB_SUB) private pubSub: PubSub) {}

  private companyId(user: AuthContextUser): bigint {
    const u = user.user;
    if (!u?.company_id) throw new Error('User is not associated with a company');
    return BigInt(u.company_id);
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

  @Query(() => [Task], { name: 'tasksByDate' })
  async getTasksByDate(
    @Args('date', { type: () => Date }) date: Date,
    @CurrentUser() user: AuthContextUser,
  ) {
    return this.tasksService.findByDate(date, this.companyId(user));
  }

  @Query(() => AllTasksResult, { name: 'allTasks' })
  async getAllTasks(
      @Args('filter', { nullable: true }) filter: TasksFilterInput,
      @CurrentUser() user: AuthContextUser,
  ) {
    const companyId = this.companyId(user);
    return this.tasksService.findAllGrouped({
      companyId,
      workspaceIds: filter?.workspaceIds?.map(id => BigInt(id)) ?? [],
      performerIds: filter?.performerIds ?? [],
      statuses: filter?.statuses ?? [],
      dateFrom: filter?.dateFrom,
      dateTo: filter?.dateTo,
      page: filter?.page ?? 1,
      limit: filter?.limit ?? 30,
    });
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

  @Subscription(() => Task, {
    filter: (payload, _vars, ctx) =>
        String(payload.taskCreated.companyId) === String(ctx.req?.user?.user?.company_id),
  })
  taskCreated() {
    return this.pubSub.asyncIterableIterator(TaskEventsEnum.TASK_CREATED);
  }

  @Subscription(() => Task, {
    filter: (payload, _vars, ctx) =>
        String(payload.taskUpdated.companyId) === String(ctx.req?.user?.user?.company_id),
  })
  taskUpdated() {
    return this.pubSub.asyncIterableIterator(TaskEventsEnum.TASK_UPDATED);
  }

  @Subscription(() => TaskDeletedPayload, {
    filter: (payload, _vars, ctx) =>
        String(payload.taskDeleted.companyId) === String(ctx.req?.user?.user?.company_id),
  })
  taskDeleted() {
    return this.pubSub.asyncIterableIterator(TaskEventsEnum.TASK_DELETED);
  }
}
