import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Suplier {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  site_url?: string | null;

  @Field(() => String, { nullable: true })
  comment?: string | null;

  @Field(() => String, { nullable: true })
  suplier_name?: string | null;

  @Field(() => String)
  storage_id!: string;

  @Field(() => Boolean)
  archived!: boolean;
}
