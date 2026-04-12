import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Invitation {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => ID, { name: 'companyId' })
  company_id!: string;

  @Field(() => Date, { name: 'createdAt' })
  created_at!: Date;

  @Field(() => Date, { name: 'updatedAt' })
  updated_at!: Date;

  @Field(() => String, { nullable: true })
  fullName?: string | null;

  @Field(() => Int, { nullable: true })
  role?: number | null;

  @Field(() => Int, { nullable: true })
  status?: number | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;
}
