import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { bigintToString } from '../../common/mappers/bigint.mapper';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async findByClientId(id: number) {
    const vehicles = await this.prisma.vehicles.findMany({
      where: { client_id: id },
    });
    return vehicles.map(bigintToString);
  }

  async findAllMakes() {
    const makes = await this.prisma.vehicle_makes.findMany()
    return makes.map(bigintToString)
  }

  async findAllModels() {
    const models = await this.prisma.vehicle_models.findMany()
    return models.map(bigintToString)
  }

  async findAllModelsByMake(makeId: number) {
    const models = await this.prisma.vehicle_models.findMany({where: {vehicle_make_id: makeId}})
    return models.map(bigintToString)
  }

  async findAllMakesByType(typeId: number) {
    const makes = await this.prisma.vehicle_makes.findMany({where: {vehicle_type: typeId}})
    return makes.map(bigintToString)
  }
}
