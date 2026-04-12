import { Prisma } from '@prisma/client';
import { CreateVehicleInput } from '@/modules/vehicle/inputs/create-vehicle.input';

export type VehicleCreateFields = Omit<CreateVehicleInput, 'clientId'>;

export function vehicleInputWithoutClientId(
  input: CreateVehicleInput,
): VehicleCreateFields {
  const { clientId: _c, ...body } = input;
  return body;
}

export function buildVehicleUncheckedCreate(
  clientId: bigint,
  input: VehicleCreateFields,
  now: Date,
): Prisma.vehiclesUncheckedCreateInput {
  return {
    client_id: clientId,
    vehicle_year: input.vehicleYear,
    vehicle_distance: input.vehicleDistance ?? null,
    vehicle_number: input.vehicleNumber ?? null,
    vehicle_vin_code: input.vehicleVinCode ?? null,
    vehicle_transmission: input.vehicleTransmission ?? null,
    vehicle_type: input.vehicleType ?? null,
    vehicle_make_id: input.vehicleMakeId ?? null,
    vehicle_model_id: input.vehicleModelId ?? null,
    vehicle_make_name: input.vehicleMakeName ?? null,
    vehicle_model_name: input.vehicleModelName ?? null,
    created_at: now,
    updated_at: now,
  };
}
