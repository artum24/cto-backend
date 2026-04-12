import { Field, ObjectType } from '@nestjs/graphql';
import { Vehicle } from './vehicle.model';
import { VehiclesMetadata } from './vehicles-metadata.model';

@ObjectType()
export class FilteredVehiclesResult {
  @Field(() => [Vehicle])
  collection!: Vehicle[];

  @Field(() => VehiclesMetadata)
  metadata!: VehiclesMetadata;
}
