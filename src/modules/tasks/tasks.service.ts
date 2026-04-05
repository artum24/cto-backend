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

  /** Verify that a task belongs to the given company via vehicle → client chain */
  private async assertCompanyOwnership(taskId: bigint, companyId: bigint) {
    const task = await this.prisma.tasks.findUnique({
      where: { id: taskId },
      include: { vehicles: { include: { clients: true } } },
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
    });
    return tasks.map((t: (typeof tasks)[number]) => this.toGraphQL(t));
  }

  async findOne(id: bigint, companyId: bigint) {
    const task = await this.assertCompanyOwnership(id, companyId);
    return this.toGraphQL(task);
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
      },
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
        updated_at: new Date(),
      },
    });
    return this.toGraphQL(updated);
  }

  async delete(id: bigint, companyId: bigint) {
    const task = await this.assertCompanyOwnership(id, companyId);
    await this.prisma.tasks.delete({ where: { id } });
    return this.toGraphQL(task);
  }
}
