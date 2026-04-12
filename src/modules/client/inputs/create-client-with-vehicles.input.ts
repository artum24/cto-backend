import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateClientInput } from './create-client.input';
import { CreateVehicleForClientInput } from '@/modules/vehicle/inputs/create-vehicle-for-client.input';

@InputType()
export class CreateClientWithVehiclesInput {
  @Field(() => CreateClientInput)
  @ValidateNested()
  @Type(() => CreateClientInput)
  client!: CreateClientInput;

  @Field(() => [CreateVehicleForClientInput])
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one vehicle is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateVehicleForClientInput)
  vehicles!: CreateVehicleForClientInput[];
}
