import { Injectable, Logger } from '@nestjs/common';
import { read, utils } from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

interface DataError {
  id: number;
  name: string | null;
  phone: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_number: string | null;
  vehicle_year: string | null;
  vehicle_vin_code: string | null;
  vehicle_distance: string | null;
  vehicle_transmission: string | null;
  errors: Record<string, string[]>;
}

/**
 * Row columns (same order as Rails xlsx):
 * [0] name, [1] phone, [2] make, [3] model,
 * [4] number, [5] year, [6] vin, [7] distance(km), [8] transmission
 */
@Injectable()
export class XlsxProcessorService {
  private readonly logger = new Logger(XlsxProcessorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parses XLSX, upserts clients/vehicles, persists a Report row for dataErrors(jobId).
   * Runs synchronously in the HTTP request (serverless-safe).
   */
  async processImport(
    jobId: string,
    fileBuffer: Buffer,
    companyId: bigint,
  ): Promise<{ errorCount: number }> {
    const dataErrors: DataError[] = [];

    try {
      const workbook = read(fileBuffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = utils.sheet_to_json(sheet, { header: 1 });

      for (const row of rows) {
        // Skip header row or empty rows
        if (
          !row ||
          row.length === 0 ||
          (typeof row[0] === 'string' && row[0].toLowerCase() === 'name')
        ) {
          continue;
        }

        await this.processRow(row, companyId, dataErrors);
      }
    } catch (err) {
      this.logger.error(`XLSX import failed for jobId=${jobId}: ${err}`);
      dataErrors.push({
        id: 0,
        name: null,
        phone: null,
        vehicle_make: null,
        vehicle_model: null,
        vehicle_number: null,
        vehicle_year: null,
        vehicle_vin_code: null,
        vehicle_distance: null,
        vehicle_transmission: null,
        errors: { file: ['Failed to parse XLSX file'] },
      });
    }

    await (this.prisma.reports as any).create({
      data: {
        job_id: jobId,
        data_errors: dataErrors as any,
        company_id: companyId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    this.logger.log(`XLSX import done. jobId=${jobId}, errors=${dataErrors.length}`);

    return { errorCount: dataErrors.length };
  }

  private async processRow(
    row: any[],
    companyId: bigint,
    dataErrors: DataError[],
  ): Promise<void> {
    const name = row[0] != null ? String(row[0]) : null;
    const phone = row[1] != null ? this.normalizePhone(String(row[1])) : null;
    const makeName = row[2] != null ? String(row[2]) : null;
    const modelName = row[3] != null ? String(row[3]) : null;
    const vehicleNumber = row[4] != null ? String(row[4]) : null;
    const vehicleYear = row[5] != null ? String(row[5]) : null;
    const vinCode = row[6] != null ? String(row[6]) : null;
    const distanceKm = row[7] != null ? Number(row[7]) : null;
    const transmission = row[8] != null ? String(row[8]) : null;

    if (!name || !phone) {
      dataErrors.push(this.buildError(dataErrors.length, row, { base: ['Name and phone are required'] }));
      return;
    }

    try {
      await this.prisma.$transaction(async (tx: PrismaClient) => {
        // Find or create client
        let client = await tx.clients.findFirst({ where: { phone, company_id: companyId } });

        if (!client) {
          client = await tx.clients.create({
            data: {
              name,
              phone,
              company_id: companyId,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
        }

        // Resolve vehicle make/model by name (case-insensitive like Rails)
        const vehicleMake = makeName
          ? await tx.vehicle_makes.findFirst({
              where: { vehicle_make_name: { contains: makeName, mode: 'insensitive' } },
            })
          : null;

        const vehicleModel = modelName
          ? await tx.vehicle_models.findFirst({
              where: { vehicle_model_name: { contains: modelName, mode: 'insensitive' } },
            })
          : null;

        await tx.vehicles.create({
          data: {
            client_id: client.id,
            vehicle_make_id: vehicleMake ? Number(vehicleMake.id) : null,
            vehicle_model_id: vehicleModel ? Number(vehicleModel.id) : null,
            vehicle_number: vehicleNumber,
            vehicle_year: vehicleYear ? parseInt(vehicleYear) : 0,
            vehicle_vin_code: vinCode,
            vehicle_distance: distanceKm != null ? distanceKm * 1000 : null,
            vehicle_transmission: transmission,
            vehicle_type: 1, // passenger_car (same as Rails default)
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      });
    } catch (err: any) {
      this.logger.warn(`Row error: ${err.message}`);
      dataErrors.push(this.buildError(dataErrors.length, row, { base: [err.message] }));
    }
  }

  private buildError(id: number, row: any[], errors: Record<string, string[]>): DataError {
    return {
      id,
      name: row[0] != null ? String(row[0]) : null,
      phone: row[1] != null ? String(row[1]) : null,
      vehicle_make: row[2] != null ? String(row[2]) : null,
      vehicle_model: row[3] != null ? String(row[3]) : null,
      vehicle_number: row[4] != null ? String(row[4]) : null,
      vehicle_year: row[5] != null ? String(row[5]) : null,
      vehicle_vin_code: row[6] != null ? String(row[6]) : null,
      vehicle_distance: row[7] != null ? String(row[7]) : null,
      vehicle_transmission: row[8] != null ? String(row[8]) : null,
      errors,
    };
  }

  private normalizePhone(phone: string): string {
    // Same logic as Rails ModelValidations.normalize_phone
    return phone.replace(/\D/g, '').replace(/^8/, '7');
  }
}
