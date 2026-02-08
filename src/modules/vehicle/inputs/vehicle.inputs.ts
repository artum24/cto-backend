import {Field, InputType} from "@nestjs/graphql";
import {IsInt, IsString} from "class-validator";

@InputType()
export class VehicleInput {
    @Field()
    @IsInt()
    page: number;

    @Field()
    @IsInt()
    limit: number;

    @Field()
    @IsString()
    search: string;
}