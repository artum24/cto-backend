import { Field, ID, ObjectType } from '@nestjs/graphql';

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
}
