import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CreateVehicleHistoryInput } from './inputs/create-vehicle-history.input';
import { UpdateVehicleHistoryInput } from './inputs/update-vehicle-history.input';

@Injectable()
export class VehicleHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: bigint) {
    const records = await this.prisma.vehicle_histories.findMany({
      where: {
        tasks: { vehicles: { clients: { company_id: companyId } } },
      },
    });
    return records.map(bigintToString);
  }

  async findOne(id: bigint, companyId: bigint) {
    const record = await this.prisma.vehicle_histories.findUnique({
      where: { id },
      include: { tasks: { include: { vehicles: { include: { clients: { select: { company_id: true } } } } } } },
    });
    if (!record) {
      throw new NotFoundException(`VehicleHistory #${id} not found`);
    }
    if (record.tasks.vehicles.clients.company_id !== companyId) {
      throw new ForbiddenException('Access denied');
    }
    const { tasks: _, ...rest } = record;
    return bigintToString(rest);
  }

  async create(input: CreateVehicleHistoryInput, companyId: bigint) {
    const task = await this.prisma.tasks.findUnique({
      where: { id: BigInt(input.task_id) },
      include: { vehicles: { include: { clients: { select: { company_id: true } } } } },
    });
    if (!task || task.vehicles.clients.company_id !== companyId) {
      throw new ForbiddenException('Task not found in your company');
    }

    const record = await this.prisma.vehicle_histories.create({
      data: {
        distance: input.distance,
        status: input.status,
        price: input.price ? input.price : null,
        task_id: BigInt(input.task_id),
        service_id: BigInt(input.service_id),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return bigintToString(record);
  }

  async update(input: UpdateVehicleHistoryInput, companyId: bigint) {
    await this.findOne(BigInt(input.id), companyId);

    const updated = await this.prisma.vehicle_histories.update({
      where: { id: BigInt(input.id) },
      data: {
        ...(input.distance !== undefined && { distance: input.distance }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.task_id !== undefined && {
          task_id: BigInt(input.task_id),
        }),
        ...(input.service_id !== undefined && {
          service_id: BigInt(input.service_id),
        }),
        updated_at: new Date(),
      },
    });
    return bigintToString(updated);
  }

  async delete(id: bigint, companyId: bigint) {
    const record = await this.findOne(id, companyId);
    await this.prisma.vehicle_histories.delete({ where: { id } });
    return record;
  }
}
