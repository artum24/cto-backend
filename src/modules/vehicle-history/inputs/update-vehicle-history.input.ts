import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateVehicleHistoryInput {
  @Field(() => ID)
  @IsNotEmpty()
  id!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  distance?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  task_id?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  service_id?: string;
}
