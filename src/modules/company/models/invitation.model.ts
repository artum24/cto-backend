import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Invitation {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => ID)
  company_id!: string;

  @Field(() => Date)
  created_at!: Date;

  @Field(() => Date)
  updated_at!: Date;
}
