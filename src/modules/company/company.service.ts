import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { bigintToString } from '../../common/mappers/bigint.mapper';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: bigint) {
    const company = await this.prisma.companies.findUnique({ where: { id } });
    if (!company) return null;
    return { ...company, id: company.id.toString() };
  }

  async findCompanyMembers(id: bigint) {
    const users = await this.prisma.users.findMany({
      where: { company_id: id },
    });
    console.log('users', users);
    const invitations = await this.prisma.invitations.findMany({
      where: { company_id: id },
    });
    return [...users.map(bigintToString), ...invitations];
  }
}
