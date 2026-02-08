import { Field, ObjectType, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class Company {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => Int, { nullable: true })
  company_type?: number | null;

  @Field(() => String, { nullable: true })
  city?: string | null;

  @Field(() => String, { nullable: true })
  address?: string | null;

  @Field(() => String, { nullable: true })
  city_ref?: string | null;

  @Field(() => String, { nullable: true })
  address_ref?: string | null;

  @Field(() => String, { nullable: true })
  house_number?: string | null;
}
