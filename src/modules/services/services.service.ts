import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CreateServiceInput } from './inputs/create-service.input';
import { UpdateServiceInput } from './inputs/update-service.input';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const services = await this.prisma.services.findMany();
    return services.map(bigintToString);
  }

  async findOne(id: bigint) {
    const service = await this.prisma.services.findUnique({
      where: { id },
    });
    if (!service) {
      throw new NotFoundException(`Service #${id} not found`);
    }
    return bigintToString(service);
  }

  async create(input: CreateServiceInput) {
    const service = await this.prisma.services.create({
      data: {
        title: input.title,
        description: input.description,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return bigintToString(service);
  }

  async update(input: UpdateServiceInput) {
    await this.findOne(BigInt(input.id));

    const updated = await this.prisma.services.update({
      where: { id: BigInt(input.id) },
      data: {
        title: input.title,
        description: input.description,
        updated_at: new Date(),
      },
    });
    return bigintToString(updated);
  }

  async delete(id: bigint) {
    const service = await this.findOne(id);

    await this.prisma.services.delete({
      where: { id },
    });
    return service;
  }
}
