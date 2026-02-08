import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: bigint) {
    return this.prisma.companies.findUnique({ where: { id } });
  }
}
