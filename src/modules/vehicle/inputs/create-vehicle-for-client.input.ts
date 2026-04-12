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
import { VehicleType } from '../enums/vehicle-type.enum';

/** Same fields as CreateVehicleInput except clientId (set after client is created). */
@InputType()
export class CreateVehicleForClientInput {
  @Field(() => Int)
  @IsInt()
  @Min(1900)
  @Max(2100)
  vehicleYear: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  vehicleDistance?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  vehicleNumber?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  vehicleVinCode?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  vehicleTransmission?: string | null;

  @Field(() => VehicleType, { nullable: true })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  vehicleMakeId?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  vehicleModelId?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  vehicleMakeName?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  vehicleModelName?: string | null;
}
