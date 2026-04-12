import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Category {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => ID)
  storage_id!: string;

  @Field(() => Boolean)
  archived!: boolean;

  @Field(() => Int, { nullable: true })
  count?: number | null;
}
