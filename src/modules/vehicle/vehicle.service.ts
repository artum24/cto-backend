import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { VehiclesInput } from '@/modules/vehicle/inputs/vehicles.input';
import { CreateVehicleInput } from '@/modules/vehicle/inputs/create-vehicle.input';
import { UpdateVehicleInput } from '@/modules/vehicle/inputs/update-vehicle.input';
import {
  buildVehicleUncheckedCreate,
  vehicleInputWithoutClientId,
} from '@/modules/vehicle/vehicle-create-data';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async findByClientId(id: number | string) {
    const clientId = typeof id === 'string' ? BigInt(id) : id;
    const vehicles = await this.prisma.vehicles.findMany({
      where: { client_id: clientId },
    });
    return vehicles.map(bigintToString);
  }

  async findAndFilter(companyId: bigint, input: VehiclesInput) {
    const { search, orderBy, page = 1, limit = 25 } = input;

    const where: Prisma.vehiclesWhereInput = {
      archived: false,
      clients: {
        company_id: companyId,
      },
    };

    if (search) {
      const phoneSearch = search.replace(/[^0-9]/g, '').slice(-10);
      where.OR = [
        { clients: { name: { contains: search, mode: 'insensitive' } } },
        {
          clients: {
            phone: { contains: phoneSearch, mode: 'insensitive' },
          },
        },
        { vehicle_make_name: { contains: search, mode: 'insensitive' } },
        { vehicle_model_name: { contains: search, mode: 'insensitive' } },
        { vehicle_number: { contains: search, mode: 'insensitive' } },
        { vehicle_vin_code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderByClause: Prisma.vehiclesOrderByWithRelationInput[] = [];
    if (orderBy?.client?.name) {
      orderByClause.push({ clients: { name: orderBy.client.name } });
    }
    if (orderBy?.vehicle?.vehicle_year) {
      orderByClause.push({ vehicle_year: orderBy.vehicle.vehicle_year });
    }
    if (orderBy?.vehicle?.vehicle_distance) {
      orderByClause.push({ vehicle_distance: orderBy.vehicle.vehicle_distance });
    }

    if (orderByClause.length === 0) {
      orderByClause.push({ created_at: 'desc' });
    }

    const vehicles = await this.prisma.vehicles.findMany({
      where,
      include: {
        clients: true,
      },
      orderBy: orderByClause,
      skip: (page - 1) * limit,
      take: limit,
    });

    type VehicleWithClient = Prisma.vehiclesGetPayload<{
      include: { clients: true };
    }>;
    return vehicles.map((v: VehicleWithClient) => ({
      ...bigintToString(v),
      client: bigintToString(v.clients),
    }));
  }

  async findAllMakes() {
    const makes = await this.prisma.vehicle_makes.findMany();
    return makes.map(bigintToString);
  }

  async findAllModels() {
    const models = await this.prisma.vehicle_models.findMany();
    return models.map(bigintToString);
  }

  async findAllModelsByMake(makeId: number) {
    const models = await this.prisma.vehicle_models.findMany({
      where: { vehicle_make_id: makeId },
    });
    return models.map(bigintToString);
  }

  async findAllMakesByType(typeId: number) {
    const makes = await this.prisma.vehicle_makes.findMany({
      where: { vehicle_type: typeId },
    });
    return makes.map(bigintToString);
  }

  async create(companyId: bigint, input: CreateVehicleInput) {
    const clientId = BigInt(input.client_id);
    const client = await this.prisma.clients.findFirst({
      where: { id: clientId, company_id: companyId },
    });
    if (!client) {
      throw new Error('Client not found or does not belong to your company.');
    }
    if (input.vehicle_number != null && input.vehicle_number !== '') {
      const existing = await this.prisma.vehicles.findFirst({
        where: { vehicle_number: input.vehicle_number },
      });
      if (existing) {
        throw new Error(
          'A vehicle with this registration number already exists.',
        );
      }
    }
    const now = new Date();
    const created = await this.prisma.vehicles.create({
      data: buildVehicleUncheckedCreate(
        clientId,
        vehicleInputWithoutClientId(input),
        now,
      ),
    });
    const withClient = await this.prisma.vehicles.findUnique({
      where: { id: created.id },
      include: { clients: true },
    });
    if (!withClient) throw new Error('Failed to load created vehicle');
    return {
      ...bigintToString(withClient),
      client: bigintToString(withClient.clients),
    };
  }

  async update(companyId: bigint, input: UpdateVehicleInput) {
    const id = BigInt(input.id);
    const existing = await this.prisma.vehicles.findFirst({
      where: { id },
      include: { clients: true },
    });
    if (!existing || existing.clients.company_id !== companyId) {
      throw new Error('Vehicle not found or does not belong to your company.');
    }
    if (
      input.vehicle_number != null &&
      input.vehicle_number !== '' &&
      input.vehicle_number !== existing.vehicle_number
    ) {
      const other = await this.prisma.vehicles.findFirst({
        where: {
          vehicle_number: input.vehicle_number,
          id: { not: id },
        },
      });
      if (other) {
        throw new Error(
          'Another vehicle already has this registration number.',
        );
      }
    }
    const data: Prisma.vehiclesUpdateInput = {
      updated_at: new Date(),
    };
    if (input.vehicle_year !== undefined && input.vehicle_year !== null)
      data.vehicle_year = input.vehicle_year;
    if (input.vehicle_distance !== undefined)
      data.vehicle_distance = input.vehicle_distance;
    if (input.vehicle_number !== undefined)
      data.vehicle_number = input.vehicle_number ?? null;
    if (input.vehicle_vin_code !== undefined)
      data.vehicle_vin_code = input.vehicle_vin_code ?? null;
    if (input.vehicle_transmission !== undefined)
      data.vehicle_transmission = input.vehicle_transmission ?? null;
    if (input.vehicle_type !== undefined)
      data.vehicle_type = input.vehicle_type ?? null;
    if (input.vehicle_make_id !== undefined) {
      data.vehicle_makes =
        input.vehicle_make_id != null
          ? { connect: { vehicle_make_id: input.vehicle_make_id } }
          : { disconnect: true };
    }
    if (input.vehicle_model_id !== undefined) {
      data.vehicle_models =
        input.vehicle_model_id != null
          ? { connect: { vehicle_model_id: input.vehicle_model_id } }
          : { disconnect: true };
    }
    if (input.vehicle_make_name !== undefined)
      data.vehicle_make_name = input.vehicle_make_name ?? null;
    if (input.vehicle_model_name !== undefined)
      data.vehicle_model_name = input.vehicle_model_name ?? null;

    await this.prisma.vehicles.update({
      where: { id },
      data,
    });
    const updated = await this.prisma.vehicles.findUnique({
      where: { id },
      include: { clients: true },
    });
    if (!updated) throw new Error('Failed to load updated vehicle');
    return {
      ...bigintToString(updated),
      client: bigintToString(updated.clients),
    };
  }

  async archive(companyId: bigint, id: string) {
    const idBigInt = BigInt(id);
    const existing = await this.prisma.vehicles.findFirst({
      where: { id: idBigInt },
      include: { clients: true },
    });
    if (!existing || existing.clients.company_id !== companyId) {
      throw new Error('Vehicle not found or does not belong to your company.');
    }
    await this.prisma.vehicles.update({
      where: { id: idBigInt },
      data: { archived: true, updated_at: new Date() },
    });
    const archived = await this.prisma.vehicles.findUnique({
      where: { id: idBigInt },
      include: { clients: true },
    });
    if (!archived) throw new Error('Failed to load archived vehicle');
    return {
      ...bigintToString(archived),
      client: bigintToString(archived.clients),
    };
  }
}

