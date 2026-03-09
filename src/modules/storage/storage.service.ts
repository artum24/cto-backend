import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';

@Injectable()
export class StorageService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCompanyId(companyId: bigint) {
    const storage = await this.prisma.storages.findFirst({
      where: { company_id: companyId },
    });
    return storage ? bigintToString(storage) : null;
  }
}
