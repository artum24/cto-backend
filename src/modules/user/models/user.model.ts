import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Company } from '../../company/models/company.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => Number, { nullable: true })
  role?: number | null;

  @Field(() => Number)
  status: number;

  @Field(() => Company)
  company: Company;
}
