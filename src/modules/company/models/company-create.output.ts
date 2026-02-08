import { Field, ObjectType } from '@nestjs/graphql';
import { Company } from './company.model';
import { User } from '../../user/models/user.model';

@ObjectType()
export class CompanyCreateOutput {
  @Field(() => Company, { nullable: true })
  company?: Company;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [String], { nullable: 'itemsAndList' })
  errors?: string[];
}
