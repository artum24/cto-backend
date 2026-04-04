import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Detail } from './detail.model';

@ObjectType()
export class DetailsListResult {
  @Field(() => [Detail])
  items!: Detail[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;
}
