import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Company } from '@/modules/company/models/company.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => Int, { nullable: true })
  role?: number | null;

  @Field(() => Int)
  status: number;

  @Field(() => Company)
  company: Company;

  @Field(() => Date, { name: 'createdAt' })
  created_at: Date;

  @Field(() => Date, { name: 'updatedAt' })
  updated_at: Date;
}
