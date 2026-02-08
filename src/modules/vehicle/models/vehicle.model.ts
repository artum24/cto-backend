import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Vehicle {
  @Field(() => ID)
  id!: string;

  @Field(() => Int, {nullable: true, name: 'vehicleYear'})
  vehicle_year: number;

  @Field(() => Int, { nullable: true, name: 'vehicleDistance' })
  vehicle_distance?: number | null;

  @Field(() => String, { nullable: true, name: 'vehicleNumber' })
  vehicle_number!: string | null;

  @Field(() => String, { nullable: true, name: 'vehicleVinCode' })
  vehicle_vin_code!: string | null;

  @Field(() => Date, {name: 'updatedAt'})
  updated_at!: Date;

  @Field(() => ID, { nullable: true, name: 'vehicleMakeId' })
  vehicle_make_id!: string | null;

  @Field(() => String, { nullable: true, name: 'vehicleMakeName' })
  vehicle_make_name!: string | null;

  @Field(() => ID, { nullable: true, name: 'vehicleModelId' })
  vehicle_model_id!: string | null;

  @Field(() => String, { nullable: true, name: 'vehicleModelName' })
  vehicle_model_name!: string | null;

  @Field(() => String, { nullable: true, name: 'vehicleTransmission' })
  vehicle_transmission!: string | null;

  @Field(() => Int, { nullable: true, name: 'vehicleType' })
  vehicle_type!: number | null;
}
