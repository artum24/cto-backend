import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VehiclesMetadata {
  @Field(() => Int)
  currentPage!: number;

  @Field(() => Int)
  limitValue!: number;

  @Field(() => Int)
  totalCount!: number;

  @Field(() => Int)
  totalPages!: number;
}
