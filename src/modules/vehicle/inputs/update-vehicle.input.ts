import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { VehicleType } from '@/modules/vehicle/enums/vehicle-type.enum';

@InputType()
export class UpdateVehicleInput {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  vehicle_year?: number | null;

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

  @Field(() => VehicleType, { nullable: true })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicle_type?: VehicleType | null;

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
