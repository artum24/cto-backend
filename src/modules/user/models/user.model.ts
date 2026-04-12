import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Company } from '@/modules/company/models/company.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => ID, { name: 'authUserId', nullable: true })
  auth_user_id?: string | null;

  @Field(() => ID, { name: 'companyId', nullable: true })
  company_id?: string | null;

  @Field(() => Int, { nullable: true })
  role?: number | null;

  @Field(() => Int, { nullable: true })
  status?: number | null;

  // resolved via @ResolveField in UserResolver
  @Field(() => String, { nullable: true })
  fullName?: string | null;

  // resolved via @ResolveField in UserResolver
  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => Company, { nullable: true })
  company?: Company | null;

  @Field(() => Date, { name: 'createdAt' })
  created_at: Date;

  @Field(() => Date, { name: 'updatedAt' })
  updated_at: Date;
}
