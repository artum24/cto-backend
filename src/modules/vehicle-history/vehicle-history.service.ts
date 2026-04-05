import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CreateVehicleHistoryInput } from './inputs/create-vehicle-history.input';
import { UpdateVehicleHistoryInput } from './inputs/update-vehicle-history.input';

@Injectable()
export class VehicleHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const records = await this.prisma.vehicle_histories.findMany();
    return records.map(bigintToString);
  }

  async findOne(id: bigint) {
    const record = await this.prisma.vehicle_histories.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`VehicleHistory #${id} not found`);
    }
    return bigintToString(record);
  }

  async create(input: CreateVehicleHistoryInput) {
    const record = await this.prisma.vehicle_histories.create({
      data: {
        distance: input.distance,
        status: input.status,
        task_id: BigInt(input.task_id),
        service_id: BigInt(input.service_id),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return bigintToString(record);
  }

  async update(input: UpdateVehicleHistoryInput) {
    await this.findOne(BigInt(input.id));

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

  async delete(id: bigint) {
    const record = await this.findOne(id);
    await this.prisma.vehicle_histories.delete({ where: { id } });
    return record;
  }
}
