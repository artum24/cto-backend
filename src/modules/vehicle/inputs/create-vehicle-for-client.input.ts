import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

/** Same fields as CreateVehicleInput except client_id (set after client is created). */
@InputType()
export class CreateVehicleForClientInput {
  @Field(() => Int)
  @IsInt()
  @Min(1900)
  @Max(2100)
  vehicle_year: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  vehicle_distance?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  vehicle_number?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  vehicle_vin_code?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  vehicle_transmission?: string | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  vehicle_type?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  vehicle_make_id?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  vehicle_model_id?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  vehicle_make_name?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  vehicle_model_name?: string | null;
}
