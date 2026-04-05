import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateVehicleHistoryInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  distance?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => ID)
  @IsNotEmpty()
  task_id!: string;

  @Field(() => ID)
  @IsNotEmpty()
  service_id!: string;
}
