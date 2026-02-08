import { Field, InputType, Int } from '@nestjs/graphql';
import { OrderByInput } from './order-by.input';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class VehiclesInput {
  @Field(() => OrderByInput, { nullable: true })
  @IsOptional()
  orderBy?: OrderByInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;
}
