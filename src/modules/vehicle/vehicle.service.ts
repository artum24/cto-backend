import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { bigintToString } from '../../common/mappers/bigint.mapper';
import { VehiclesInput } from './inputs/vehicles.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async findByClientId(id: number) {
    const vehicles = await this.prisma.vehicles.findMany({
      where: { client_id: id },
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

    return vehicles.map((v) => ({
      ...bigintToString(v),
      client: bigintToString(v.clients!),
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
}

