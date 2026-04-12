import { InputType } from '@nestjs/graphql';
import { UpdateVehicleInput } from './update-vehicle.input';

/** Alias for UpdateVehicleInput — exposed as VehicleUpdateInput in the GraphQL schema. */
@InputType()
export class VehicleUpdateInput extends UpdateVehicleInput {}
