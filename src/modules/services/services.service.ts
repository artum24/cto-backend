import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CreateServiceInput } from './inputs/create-service.input';
import { UpdateServiceInput } from './inputs/update-service.input';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: bigint) {
    const services = await this.prisma.services.findMany({
      where: { company_id: companyId },
    });
    return services.map(bigintToString);
  }

  async findOne(id: bigint, companyId: bigint) {
    const service = await this.prisma.services.findFirst({
      where: { id, company_id: companyId },
    });
    if (!service) {
      throw new NotFoundException(`Service #${id} not found`);
    }
    return bigintToString(service);
  }

  async create(input: CreateServiceInput, companyId: bigint) {
    const service = await this.prisma.services.create({
      data: {
        title: input.title,
        description: input.description,
        price: input.price ? input.price : null,
        company_id: companyId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return bigintToString(service);
  }

  async update(input: UpdateServiceInput, companyId: bigint) {
    await this.findOne(BigInt(input.id), companyId);

    const updated = await this.prisma.services.update({
      where: { id: BigInt(input.id) },
      data: {
        title: input.title,
        description: input.description,
        ...(input.price !== undefined && { price: input.price }),
        updated_at: new Date(),
      },
    });
    return bigintToString(updated);
  }

  async delete(id: bigint, companyId: bigint) {
    const service = await this.findOne(id, companyId);

    await this.prisma.services.delete({
      where: { id },
    });
    return service;
  }
}
