import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DetailHistoryUser {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  full_name?: string | null;
}
