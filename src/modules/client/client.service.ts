import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { bigintToString } from '../../common/mappers/bigint.mapper';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(company_id: bigint) {
    const clients = await this.prisma.clients.findMany({
      where: { company_id },
    });
    return clients.map(bigintToString);
  }

  async findByClientId(company_id: bigint, id: number) {
    const client = await this.prisma.clients.findFirst({
      where: { company_id, id },
    });
    if (!client) {
      throw new Error('Client not found');
    }
    return bigintToString(client);
  }
}
