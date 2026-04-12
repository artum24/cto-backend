import { Field, ObjectType, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class Company {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => Int, { nullable: true, name: 'companyType' })
  company_type?: number | null;

  @Field(() => String, { nullable: true })
  city?: string | null;

  @Field(() => String, { nullable: true })
  address?: string | null;

  @Field(() => String, { nullable: true, name: 'cityRef' })
  city_ref?: string | null;

  @Field(() => String, { nullable: true, name: 'addressRef' })
  address_ref?: string | null;

  @Field(() => String, { nullable: true, name: 'houseNumber' })
  house_number?: string | null;

  @Field(() => Date, { name: 'createdAt' })
  created_at!: Date;

  @Field(() => Date, { name: 'updatedAt' })
  updated_at!: Date;
}
