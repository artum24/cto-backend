import {Field, ID, Int, ObjectType} from "@nestjs/graphql";
import {VehicleModel} from "./vehicleModel.model";

@ObjectType()
export class VehicleMake {
    @Field(() => ID, {})
    id!: string;

    @Field(() => Int, { name: 'vehicleMakeId' })
    vehicle_make_id!: number;

    @Field(() => String, { name: 'vehicleMakeName' })
    vehicle_make_name!: string

    @Field(() => Int, { name: 'vehicleType' })
    vehicle_type!: number

    @Field(() => Date, {name: 'createdAt'})
    created_at!: Date

    @Field(() => Date, {name: 'updatedAt'})
    updated_at!: Date
}
