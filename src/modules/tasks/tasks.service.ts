import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CreateTaskInput } from './inputs/create-task.input';
import { UpdateTaskInput } from './inputs/update-task.input';
import {
  STATUS_ENUM_TO_INT,
  STATUS_INT_TO_ENUM,
  TaskStatus,
} from './enums/task-status.enum';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private mapStatus(statusInt: number): TaskStatus {
    return STATUS_INT_TO_ENUM[statusInt] ?? TaskStatus.CREATED;
  }

  private toGraphQL(task: any) {
    return {
      ...bigintToString(task),
      status: this.mapStatus(task.status),
    };
  }

  async findAll() {
    const tasks = await this.prisma.tasks.findMany();
    return tasks.map((t: (typeof tasks)[number]) => this.toGraphQL(t));
  }

  async findOne(id: bigint) {
    const task = await this.prisma.tasks.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return this.toGraphQL(task);
  }

  async create(input: CreateTaskInput) {
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
      },
    });
    return this.toGraphQL(task);
  }

  async update(input: UpdateTaskInput) {
    await this.findOne(BigInt(input.id));

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
        updated_at: new Date(),
      },
    });
    return this.toGraphQL(updated);
  }

  async delete(id: bigint) {
    const task = await this.findOne(id);
    await this.prisma.tasks.delete({ where: { id } });
    return task;
  }
}
