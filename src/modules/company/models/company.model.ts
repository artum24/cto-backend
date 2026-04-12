import { Field, ObjectType, ID } from '@nestjs/graphql';
import { CompanyType } from '@/modules/company/enums/company-type.enum';

@ObjectType()
export class Company {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => CompanyType, { nullable: true, name: 'companyType' })
  company_type?: CompanyType | null;

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
