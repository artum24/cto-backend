import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '@/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

const VEHICLE_TYPE_MAP: Record<number, string> = {
  1: 'Motorcycle',
  2: 'Passenger Car',
  3: 'Truck',
  7: 'Multipurpose Passenger Vehicle (MPV)',
};

// GetMakesForVehicleType returns MakeId/MakeName
// GetAllMakes returns Make_ID/Make_Name — handle both
interface NhtsaMake {
  MakeId?: number;
  MakeName?: string;
  Make_ID?: number;
  Make_Name?: string;
}

interface NhtsaModel {
  Model_ID: number;
  Model_Name: string;
  Make_ID: number;
  Make_Name: string;
}

interface MakeEntry {
  makeId: number;
  makeName: string;
  vehicleType: number;
}

function getMakeId(m: NhtsaMake): number {
  return (m.MakeId ?? m.Make_ID)!;
}

function getMakeName(m: NhtsaMake): string {
  return (m.MakeName ?? m.Make_Name)!;
}

@Injectable()
export class NhtsaSyncService {
  private readonly logger = new Logger(NhtsaSyncService.name);

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async syncAll(): Promise<{ makesUpserted: number; modelsUpserted: number }> {
    this.logger.log('Starting NHTSA sync...');

    const makesByType = await this.fetchMakesByType();

    // Deduplicate: first vehicle type encountered wins for a given make_id
    const uniqueMakes = new Map<number, MakeEntry>();
    for (const { vehicleType, makes } of makesByType) {
      for (const m of makes) {
        const id = getMakeId(m);
        const name = getMakeName(m);
        if (id && name && !uniqueMakes.has(id)) {
          uniqueMakes.set(id, { makeId: id, makeName: name, vehicleType });
        }
      }
    }

    this.logger.log(
      `${uniqueMakes.size} unique makes to process. Fetching models (only makes with ≥1 model will be saved)...`,
    );

    const { makesUpserted, modelsUpserted } = await this.fetchModelsAndUpsert(
      [...uniqueMakes.values()],
    );

    this.logger.log(
      `NHTSA sync complete: ${makesUpserted} makes saved, ${modelsUpserted} models saved (skipped makes with no models)`,
    );
    return { makesUpserted, modelsUpserted };
  }

  private async fetchMakesByType(): Promise<
    { vehicleType: number; makes: NhtsaMake[] }[]
  > {
    const results: { vehicleType: number; makes: NhtsaMake[] }[] = [];

    for (const [vehicleTypeStr, nhtsaTypeName] of Object.entries(VEHICLE_TYPE_MAP)) {
      const vehicleType = Number(vehicleTypeStr);
      try {
        const url = `${NHTSA_BASE}/GetMakesForVehicleType/${encodeURIComponent(nhtsaTypeName)}?format=json`;
        const { data } = await firstValueFrom(
          this.http.get<{ Results: NhtsaMake[] }>(url),
        );
        const makes = data?.Results ?? [];
        this.logger.log(`Fetched ${makes.length} makes for type ${nhtsaTypeName}`);
        results.push({ vehicleType, makes });
      } catch (err) {
        this.logger.error(`Failed to fetch makes for type ${nhtsaTypeName}`, err);
      }
      await delay(300);
    }

    return results;
  }

  private async fetchModelsAndUpsert(
    makes: MakeEntry[],
  ): Promise<{ makesUpserted: number; modelsUpserted: number }> {
    let makesUpserted = 0;
    let modelsUpserted = 0;
    let checked = 0;
    const now = new Date();
    const CONCURRENCY = 5;

    const processMake = async (entry: MakeEntry): Promise<void> => {
      const { makeId, makeName, vehicleType } = entry;
      try {
        const url = `${NHTSA_BASE}/GetModelsForMakeId/${makeId}?format=json`;
        const { data } = await firstValueFrom(
          this.http.get<{ Results: NhtsaModel[] }>(url),
        );
        const models = data?.Results ?? [];

        if (models.length === 0) return;

        await this.prisma.vehicle_makes.upsert({
          where: { vehicle_make_id: makeId },
          update: { vehicle_make_name: makeName, updated_at: now },
          create: {
            vehicle_make_id: makeId,
            vehicle_make_name: makeName,
            vehicle_type: vehicleType,
            created_at: now,
            updated_at: now,
          },
        });

        // upsert junction row — make may belong to multiple vehicle types
        await this.prisma.vehicle_make_types.upsert({
          where: { vehicle_make_id_vehicle_type: { vehicle_make_id: makeId, vehicle_type: vehicleType } },
          update: {},
          create: { vehicle_make_id: makeId, vehicle_type: vehicleType },
        });

        for (let j = 0; j < models.length; j += 50) {
          const chunk = models.slice(j, j + 50);
          await this.prisma.$transaction(
            chunk.map((m) =>
              this.prisma.vehicle_models.upsert({
                where: { vehicle_model_id: m.Model_ID },
                update: { vehicle_model_name: m.Model_Name, updated_at: now },
                create: {
                  vehicle_model_id: m.Model_ID,
                  vehicle_model_name: m.Model_Name,
                  vehicle_type: vehicleType,
                  vehicle_make_id: makeId,
                  created_at: now,
                  updated_at: now,
                },
              }),
            ),
          );
        }

        makesUpserted++;
        modelsUpserted += models.length;
      } catch (err) {
        this.logger.error(`Failed to process make ${makeId} (${makeName})`, err);
      } finally {
        checked++;
        if (checked % 100 === 0 || checked === makes.length) {
          this.logger.log(
            `Progress: ${checked}/${makes.length} checked, ${makesUpserted} saved, ${modelsUpserted} models`,
          );
        }
      }
    };

    // Process makes in parallel batches of CONCURRENCY
    for (let i = 0; i < makes.length; i += CONCURRENCY) {
      const batch = makes.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map(processMake));
      await delay(200);
    }

    return { makesUpserted, modelsUpserted };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
