import { Field, ObjectType } from '@nestjs/graphql';
import { Company } from '@/modules/company/models/company.model';
import { User } from '@/modules/user/models/user.model';

@ObjectType()
export class CompanyCreateOutput {
  @Field(() => Company, { nullable: true })
  company?: Company;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [String], { nullable: 'itemsAndList' })
  errors?: string[];
}
