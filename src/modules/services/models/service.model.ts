import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Service {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}
