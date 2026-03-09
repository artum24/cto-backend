import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Storage {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => ID)
  company_id!: string;
}
