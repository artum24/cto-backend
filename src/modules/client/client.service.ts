import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { bigintToString } from '../../common/mappers/bigint.mapper';
import { PhoneValidationValues } from '../../common/enums/phone-validation-values.enum';

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

  async validatePhone(
    company_id: bigint,
    phone: string,
  ): Promise<PhoneValidationValues> {
    const normalizedPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const count = await this.prisma.clients.count({
      where: {
        company_id,
        phone: normalizedPhone,
      },
    });

    return count > 0
      ? PhoneValidationValues.INVALID
      : PhoneValidationValues.VALID;
  }
}
