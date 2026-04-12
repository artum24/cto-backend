import { createUnionType } from '@nestjs/graphql';
import { User } from '@/modules/user/models/user.model';
import { Invitation } from '@/modules/company/models/invitation.model';

export const CompanyMemberUnion = createUnionType({
  name: 'CompanyMember',
  types: () => [Invitation, User] as const,
  resolveType(value: Record<string, unknown>) {
    if ('auth_user_id' in value) return User;
    return Invitation;
  },
});
