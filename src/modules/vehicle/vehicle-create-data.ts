import { Prisma } from '@prisma/client';
import { CreateVehicleInput } from '@/modules/vehicle/inputs/create-vehicle.input';

export type VehicleCreateFields = Omit<CreateVehicleInput, 'client_id'>;

export function vehicleInputWithoutClientId(
  input: CreateVehicleInput,
): VehicleCreateFields {
  const { client_id: _c, ...body } = input;
  return body;
}

export function buildVehicleUncheckedCreate(
  clientId: bigint,
  input: VehicleCreateFields,
  now: Date,
): Prisma.vehiclesUncheckedCreateInput {
  return {
    client_id: clientId,
    vehicle_year: input.vehicle_year,
    vehicle_distance: input.vehicle_distance ?? null,
    vehicle_number: input.vehicle_number ?? null,
    vehicle_vin_code: input.vehicle_vin_code ?? null,
    vehicle_transmission: input.vehicle_transmission ?? null,
    vehicle_type: input.vehicle_type ?? null,
    vehicle_make_id: input.vehicle_make_id ?? null,
    vehicle_model_id: input.vehicle_model_id ?? null,
    vehicle_make_name: input.vehicle_make_name ?? null,
    vehicle_model_name: input.vehicle_model_name ?? null,
    created_at: now,
    updated_at: now,
  };
}
