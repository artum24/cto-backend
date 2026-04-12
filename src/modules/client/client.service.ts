import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { PhoneValidationValues } from '@/common/enums/phone-validation-values.enum';
import { CreateClientInput } from './inputs/create-client.input';
import { CreateClientWithVehiclesInput } from './inputs/create-client-with-vehicles.input';
import { UpdateClientInput } from './inputs/update-client.input';
import { buildVehicleUncheckedCreate } from '@/modules/vehicle/vehicle-create-data';
import type { VehicleCreateFields } from '@/modules/vehicle/vehicle-create-data';

const normalizePhone = (phone: string) =>
  phone.replace(/[^0-9]/g, '').slice(-10);

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(company_id: bigint, includeArchived = false) {
    const clients = await this.prisma.clients.findMany({
      where: {
        company_id,
        ...(includeArchived ? {} : { archived: false }),
      },
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
    const normalizedPhone = normalizePhone(phone);
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

  async create(companyId: bigint, input: CreateClientInput) {
    const phone = normalizePhone(input.phone);
    const validation = await this.validatePhone(companyId, input.phone);
    if (validation === PhoneValidationValues.INVALID) {
      throw new Error(
        'A client with this phone number already exists in your company.',
      );
    }
    const now = new Date();
    const client = await this.prisma.clients.create({
      data: {
        company_id: companyId,
        name: input.name ?? null,
        phone,
        created_at: now,
        updated_at: now,
      },
    });
    return bigintToString(client);
  }

  async createWithVehicles(companyId: bigint, input: CreateClientWithVehiclesInput) {
    const phone = normalizePhone(input.client.phone);
    const validation = await this.validatePhone(companyId, input.client.phone);
    if (validation === PhoneValidationValues.INVALID) {
      throw new Error(
        'A client with this phone number already exists in your company.',
      );
    }

    const plateNumbers = input.vehicles
      .map((v) => v.vehicle_number)
      .filter((n): n is string => n != null && n !== '');
    if (new Set(plateNumbers).size !== plateNumbers.length) {
      throw new Error(
        'Duplicate vehicle registration numbers in the same request.',
      );
    }

    const clientRow = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const client = await tx.clients.create({
        data: {
          company_id: companyId,
          name: input.client.name ?? null,
          phone,
          created_at: now,
          updated_at: now,
        },
      });

      for (const v of input.vehicles) {
        if (v.vehicle_number != null && v.vehicle_number !== '') {
          const existing = await tx.vehicles.findFirst({
            where: { vehicle_number: v.vehicle_number },
          });
          if (existing) {
            throw new Error(
              'A vehicle with this registration number already exists.',
            );
          }
        }
        await tx.vehicles.create({
          data: buildVehicleUncheckedCreate(
            client.id,
            v as VehicleCreateFields,
            now,
          ),
        });
      }

      return client;
    });

    return bigintToString(clientRow);
  }

  async update(companyId: bigint, input: UpdateClientInput) {
    const id = BigInt(input.id);
    const existing = await this.prisma.clients.findFirst({
      where: { id, company_id: companyId },
    });
    if (!existing) {
      throw new Error('Client not found');
    }
    const data: { name?: string | null; phone?: string; updated_at: Date } = {
      updated_at: new Date(),
    };
    if (input.name !== undefined) data.name = input.name ?? null;
    if (input.phone != null && input.phone !== '') {
      const phone = normalizePhone(String(input.phone));
      const other = await this.prisma.clients.findFirst({
        where: {
          company_id: companyId,
          phone,
          id: { not: id },
        },
      });
      if (other) {
        throw new Error(
          'Another client in your company already has this phone number.',
        );
      }
      data.phone = phone;
    }
    const client = await this.prisma.clients.update({
      where: { id },
      data,
    });
    return bigintToString(client);
  }

  async archive(companyId: bigint, id: string) {
    const idBigInt = BigInt(id);
    const existing = await this.prisma.clients.findFirst({
      where: { id: idBigInt, company_id: companyId },
    });
    if (!existing) {
      throw new Error('Client not found');
    }
    const client = await this.prisma.clients.update({
      where: { id: idBigInt },
      data: { archived: true, updated_at: new Date() },
    });
    return bigintToString(client);
  }

  async remove(companyId: bigint, id: string): Promise<boolean> {
    const idBigInt = BigInt(id);
    const existing = await this.prisma.clients.findFirst({
      where: { id: idBigInt, company_id: companyId },
    });
    if (!existing) {
      throw new Error('Client not found');
    }
    const vehiclesCount = await this.prisma.vehicles.count({
      where: { client_id: idBigInt },
    });
    if (vehiclesCount > 0) {
      throw new Error(
        `Cannot delete client: ${vehiclesCount} vehicle(s) are still linked. Remove or reassign them first.`,
      );
    }
    await this.prisma.clients.delete({ where: { id: idBigInt } });
    return true;
  }
}
