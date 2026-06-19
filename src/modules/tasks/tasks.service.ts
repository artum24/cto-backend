import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CreateTaskInput } from './inputs/create-task.input';
import { UpdateTaskInput } from './inputs/update-task.input';
import {
  STATUS_ENUM_TO_INT,
  STATUS_INT_TO_ENUM,
  TaskStatus,
} from './enums/task-status.enum';
import {Prisma} from "@prisma/client";
import dayjs from "dayjs";
import {Task} from "@/modules/tasks/models/task.model";

type TaskDB = Prisma.tasksGetPayload<{
  include: {
    vehicles: { include: { clients: true; vehicle_makes: true; vehicle_models: true } };
    workspaces: true;
    users: true;
  }
}>

const TASK_INCLUDE = {
  vehicles: {
    include: {
      clients: true,
      vehicle_makes: true,
      vehicle_models: true,
    }
  },
  workspaces: true,
  users: true,
} satisfies Prisma.tasksInclude

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private mapStatus(task: TaskDB): TaskStatus {
    const status = STATUS_INT_TO_ENUM[task.status];
    const isOverdue = task.end_time && task.end_time < new Date() && status !== TaskStatus.FINISHED;
    if (isOverdue) {
      return TaskStatus.OVERDUE;
    }
    return status;
  }

  private toGraphQL(task: TaskDB) {
    const { vehicles, workspaces, users, ...rest } = task;
    const { clients, vehicle_makes, vehicle_models, ...vehicleRest } = vehicles ?? {};
    return {
      ...bigintToString(rest),
      status: this.mapStatus(task),
      vehicle: vehicles ? {
        ...bigintToString(vehicleRest),
        vehicle_make_name: vehicle_makes?.vehicle_make_name ?? null,
        vehicle_model_name: vehicle_models?.vehicle_model_name ?? null,
        client: clients ? bigintToString(clients) : null,
      } : null,
      workspace: workspaces ? bigintToString(workspaces) : null,
      performer: users ? bigintToString(users) : null,
    };
  }

  /** Verify that a task belongs to the given company via vehicle → client chain */
  private async assertCompanyOwnership(taskId: bigint, companyId: bigint) {
    const task = await this.prisma.tasks.findUnique({
      where: { id: taskId },
      // include: { vehicles: { include: { clients: true } } },
      include: TASK_INCLUDE,
    });
    if (!task) throw new NotFoundException(`Task #${taskId} not found`);
    if (task.vehicles.clients.company_id !== companyId) {
      throw new ForbiddenException('Access denied');
    }
    return task;
  }

  async findAll(companyId: bigint) {
    const tasks = await this.prisma.tasks.findMany({
      where: {
        vehicles: { clients: { company_id: companyId } },
      },
      include: TASK_INCLUDE,
    });
    return tasks.map((t) => this.toGraphQL(t));
  }

  async findOne(id: bigint, companyId: bigint) {
    const task = await this.assertCompanyOwnership(id, companyId);
    return this.toGraphQL(task);
  }

  async findByDate(date: Date, companyId: bigint) {
    const from = dayjs(date).startOf('day').toDate();
    const to = dayjs(date).endOf('day').toDate();
    const tasks = await this.prisma.tasks.findMany({
      where: {
        start_time: {gte: from, lte: to},
        vehicles: { clients: { company_id: companyId } },
      },
      include: TASK_INCLUDE,
    })
    return tasks.map((t) => this.toGraphQL(t));
  }

  async findAllGrouped({workspaceIds, companyId, performerIds = [], statuses = []}: {workspaceIds: bigint[], companyId: bigint, performerIds?: string[], statuses?: TaskStatus[]}) {
    const tasks = await this.prisma.tasks.findMany({
      where: {
        vehicles: {
          clients: {
            company_id: companyId
          }
        },
        ...(workspaceIds.length > 0 && { workspace_id: { in: workspaceIds } }),
        ...(performerIds.length > 0 && { performer_id: { in: performerIds } }),
        ...(statuses?.length > 0 && { status: { in: statuses.map(s => STATUS_ENUM_TO_INT[s]) } }),
      },
      include: TASK_INCLUDE,
    })
    const groupedMap = new Map<string, {tasks: TaskDB[], count: number}>();
    for (const task of tasks) {
      const date = task.start_time
          ? dayjs(task.start_time).format('YYYY-MM-DD')
          : 'no-date';
      if (!groupedMap.has(date)) {
        groupedMap.set(date, { tasks: [], count: 0 });
      }
      groupedMap.get(date)!.tasks.push(task);
      groupedMap.get(date)!.count++;
    }
    return Array.from(groupedMap.entries()).map(([date, {tasks, count}]) => ({
      date,
      count,
      tasks: tasks.map(t => this.toGraphQL(t)),
    }));
  }

  async create(input: CreateTaskInput, companyId: bigint) {
    // Verify the vehicle belongs to this company
    const vehicle = await this.prisma.vehicles.findFirst({
      where: { id: BigInt(input.vehicle_id), clients: { company_id: companyId } },
    });
    if (!vehicle) throw new ForbiddenException('Vehicle not found in your company');

    const statusInt = input.status
      ? STATUS_ENUM_TO_INT[input.status]
      : STATUS_ENUM_TO_INT[TaskStatus.CREATED];

    const task = await this.prisma.tasks.create({
      data: {
        title: input.title,
        status: statusInt,
        vehicle_id: BigInt(input.vehicle_id),
        created_at: new Date(),
        updated_at: new Date(),
        workspace_id: input.workspace_id ? BigInt(input.workspace_id) : null,
        performer_id: input.performer_id ?? null,
        start_time: input.start_time || null,
        end_time: input.end_time || null,
      },
      include: TASK_INCLUDE,
    });
    return this.toGraphQL(task);
  }

  async update(input: UpdateTaskInput, companyId: bigint) {
    await this.assertCompanyOwnership(BigInt(input.id), companyId);

    const updated = await this.prisma.tasks.update({
      where: { id: BigInt(input.id) },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.status !== undefined && {
          status: STATUS_ENUM_TO_INT[input.status],
        }),
        ...(input.vehicle_id !== undefined && {
          vehicle_id: BigInt(input.vehicle_id),
        }),
        ...(input.workspace_id !== undefined && {
          workspace_id: BigInt(input.workspace_id),
        }),
        ...(input.performer_id !== undefined && {
          performer_id: input.performer_id,
        }),
        ...(input.start_time !== undefined && {
          start_time: input.start_time,
        }),
        ...(input.end_time !== undefined && {
          end_time: input.end_time,
        }),
        updated_at: new Date(),
      },
      include: TASK_INCLUDE,
    });
    return this.toGraphQL(updated);
  }

  async delete(id: bigint, companyId: bigint) {
    const task = await this.assertCompanyOwnership(id, companyId);
    await this.prisma.tasks.delete({ where: { id } });
    return this.toGraphQL(task);
  }
}
