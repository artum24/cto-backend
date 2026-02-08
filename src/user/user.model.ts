import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Company } from '../company/company.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  email?: string | null;

  @Field(() => Number, { nullable: true })
  role?: number | null;

  @Field(() => Number)
  status: number;

  @Field(() => Company)
  company: Company;
}
