import {Field, ID, Int, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class VehicleModel {
    @Field(() => ID)
    id!: string;

    @Field(() => Int, { name: 'vehicleModelId' })
    vehicle_model_id!: number;

    @Field(() => String, { name: 'vehicleModelName' })
    vehicle_model_name!: string

    @Field(() => Number, { name: 'vehicleType' })
    vehicle_type!: number

    @Field(() => ID, { name: 'vehicleMakeId' })
    vehicle_make_id!: string

    @Field(() => Date, { name: 'createdAt' })
    created_at!: Date

    @Field(() => Date, { name: 'updatedAt' })
    updated_at!: Date
}