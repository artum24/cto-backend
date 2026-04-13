import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserRoles } from '@/modules/user/enums/user-roles.enum';
import { UserStatuses } from '@/modules/user/enums/user-statuses.enum';

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

  @Field(() => UserRoles, { nullable: true })
  role?: UserRoles | null;

  @Field(() => UserStatuses, { nullable: true })
  status?: UserStatuses | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;
}
