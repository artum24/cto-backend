import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { VehiclesInput } from '@/modules/vehicle/inputs/vehicles.input';
import { CreateVehicleInput } from '@/modules/vehicle/inputs/create-vehicle.input';
import { UpdateVehicleInput } from '@/modules/vehicle/inputs/update-vehicle.input';
import {
  buildVehicleUncheckedCreate,
  vehicleInputWithoutClientId,
} from '@/modules/vehicle/vehicle-create-data';
import { VehicleType } from './enums/vehicle-type.enum';
import { Prisma } from '@prisma/client';

type VehicleWithClient = Prisma.vehiclesGetPayload<{ include: { clients: true } }>;

function mapVehicle(v: VehicleWithClient) {
  const { clients, ...rest } = v;
  return {
    ...bigintToString(rest),
    client: bigintToString(clients),
  };
}

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async findByClientId(id: number | string) {
    const clientId = BigInt(String(id));
    const vehicles = await this.prisma.vehicles.findMany({
      where: { client_id: clientId },
    });
    return vehicles.map(bigintToString);
  }

  private buildVehicleWhere(
    companyId: bigint,
    search?: string | null,
  ): Prisma.vehiclesWhereInput {
    const where: Prisma.vehiclesWhereInput = {
      archived: false,
      clients: { company_id: companyId },
    };
    if (search) {
      const phoneSearch = search.replace(/[^0-9]/g, '').slice(-10);
      where.OR = [
        { clients: { name: { contains: search, mode: 'insensitive' } } },
        { clients: { phone: { contains: phoneSearch, mode: 'insensitive' } } },
        { vehicle_make_name: { contains: search, mode: 'insensitive' } },
        { vehicle_model_name: { contains: search, mode: 'insensitive' } },
        { vehicle_number: { contains: search, mode: 'insensitive' } },
        { vehicle_vin_code: { contains: search, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  private buildOrderByClause(
    orderBy?: VehiclesInput['orderBy'],
  ): Prisma.vehiclesOrderByWithRelationInput[] {
    const clause: Prisma.vehiclesOrderByWithRelationInput[] = [];
    if (orderBy?.client?.name) clause.push({ clients: { name: orderBy.client.name } });
    if (orderBy?.vehicle?.vehicle_year) clause.push({ vehicle_year: orderBy.vehicle.vehicle_year });
    if (orderBy?.vehicle?.vehicle_distance) clause.push({ vehicle_distance: orderBy.vehicle.vehicle_distance });
    if (clause.length === 0) clause.push({ created_at: 'desc' });
    return clause;
  }

  async findAndFilter(companyId: bigint, input: VehiclesInput) {
    const { search, orderBy } = input;
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, Math.max(1, input.limit ?? 25));
    const where = this.buildVehicleWhere(companyId, search);
    const orderByClause = this.buildOrderByClause(orderBy);

    const vehicles = await this.prisma.vehicles.findMany({
      where,
      include: { clients: true },
      orderBy: orderByClause,
      skip: (page - 1) * limit,
      take: limit,
    });

    return vehicles.map(mapVehicle);
  }

  async filteredVehicles(
    companyId: bigint,
    opts: { page?: number | null; limit?: number | null; search?: string | null; orderBy?: VehiclesInput['orderBy'] },
  ) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 25));
    const where = this.buildVehicleWhere(companyId, opts.search);
    const orderByClause = this.buildOrderByClause(opts.orderBy);

    const [vehicles, totalCount] = await Promise.all([
      this.prisma.vehicles.findMany({
        where,
        include: { clients: true },
        orderBy: orderByClause,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vehicles.count({ where }),
    ]);

    return {
      collection: vehicles.map(mapVehicle),
      metadata: {
        currentPage: page,
        limitValue: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findAllModelsByMake(vehicleMakeId: number, vehicleType: VehicleType) {
    const models = await this.prisma.vehicle_models.findMany({
      where: { vehicle_make_id: vehicleMakeId, vehicle_type: vehicleType },
    });
    return models.map(bigintToString);
  }

  async findAllMakesByType(vehicleType: VehicleType) {
    const makes = await this.prisma.vehicle_makes.findMany({
      where: { vehicle_type: vehicleType },
    });
    return makes.map(bigintToString);
  }

  async create(companyId: bigint, input: CreateVehicleInput) {
    const clientId = BigInt(input.clientId);
    const client = await this.prisma.clients.findFirst({
      where: { id: clientId, company_id: companyId },
    });
    if (!client) {
      throw new NotFoundException('Client not found or does not belong to your company.');
    }
    if (input.vehicleNumber != null && input.vehicleNumber !== '') {
      // Scope uniqueness check to this company (BUG-1 fix)
      const existing = await this.prisma.vehicles.findFirst({
        where: {
          vehicle_number: input.vehicleNumber,
          clients: { company_id: companyId },
        },
      });
      if (existing) {
        throw new BadRequestException(
          'A vehicle with this registration number already exists in your company.',
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
      include: { clients: true },
    });
    return mapVehicle(created);
  }

  async update(companyId: bigint, input: UpdateVehicleInput) {
    const id = BigInt(input.id);
    const existing = await this.prisma.vehicles.findFirst({
      where: { id },
      include: { clients: true },
    });
    if (!existing || existing.clients.company_id !== companyId) {
      throw new NotFoundException('Vehicle not found or does not belong to your company.');
    }
    if (
      input.vehicle_number != null &&
      input.vehicle_number !== '' &&
      input.vehicle_number !== existing.vehicle_number
    ) {
      // Scope uniqueness check to this company (BUG-1 fix)
      const other = await this.prisma.vehicles.findFirst({
        where: {
          vehicle_number: input.vehicle_number,
          id: { not: id },
          clients: { company_id: companyId },
        },
      });
      if (other) {
        throw new BadRequestException(
          'Another vehicle in your company already has this registration number.',
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
      if (input.vehicle_make_id != null) {
        data.vehicle_makes = { connect: { vehicle_make_id: input.vehicle_make_id } };
        // Sync denormalized name unless caller overrides it explicitly
        if (input.vehicle_make_name === undefined) {
          const make = await this.prisma.vehicle_makes.findUnique({
            where: { vehicle_make_id: input.vehicle_make_id },
          });
          data.vehicle_make_name = make?.vehicle_make_name ?? null;
        }
      } else {
        data.vehicle_makes = { disconnect: true };
        if (input.vehicle_make_name === undefined) data.vehicle_make_name = null;
      }
    }
    if (input.vehicle_model_id !== undefined) {
      if (input.vehicle_model_id != null) {
        data.vehicle_models = { connect: { vehicle_model_id: input.vehicle_model_id } };
        // Sync denormalized name unless caller overrides it explicitly
        if (input.vehicle_model_name === undefined) {
          const model = await this.prisma.vehicle_models.findUnique({
            where: { vehicle_model_id: input.vehicle_model_id },
          });
          data.vehicle_model_name = model?.vehicle_model_name ?? null;
        }
      } else {
        data.vehicle_models = { disconnect: true };
        if (input.vehicle_model_name === undefined) data.vehicle_model_name = null;
      }
    }
    if (input.vehicle_make_name !== undefined)
      data.vehicle_make_name = input.vehicle_make_name ?? null;
    if (input.vehicle_model_name !== undefined)
      data.vehicle_model_name = input.vehicle_model_name ?? null;

    const updated = await this.prisma.vehicles.update({
      where: { id },
      data,
      include: { clients: true },
    });
    return mapVehicle(updated);
  }

  async archive(companyId: bigint, id: string) {
    const idBigInt = BigInt(id);
    const existing = await this.prisma.vehicles.findFirst({
      where: { id: idBigInt },
      include: { clients: true },
    });
    if (!existing || existing.clients.company_id !== companyId) {
      throw new NotFoundException('Vehicle not found or does not belong to your company.');
    }
    const archived = await this.prisma.vehicles.update({
      where: { id: idBigInt },
      data: { archived: true, updated_at: new Date() },
      include: { clients: true },
    });
    return mapVehicle(archived);
  }

  async remove(companyId: bigint, id: string): Promise<boolean> {
    const idBigInt = BigInt(id);
    const existing = await this.prisma.vehicles.findFirst({
      where: { id: idBigInt },
      include: { clients: true },
    });
    if (!existing || existing.clients.company_id !== companyId) {
      throw new NotFoundException('Vehicle not found or does not belong to your company.');
    }
    const tasksCount = await this.prisma.tasks.count({
      where: { vehicle_id: idBigInt },
    });
    if (tasksCount > 0) {
      throw new BadRequestException(
        `Cannot delete vehicle: ${tasksCount} task(s) are still linked.`,
      );
    }
    await this.prisma.vehicles.delete({ where: { id: idBigInt } });
    return true;
  }
}
