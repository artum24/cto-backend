import { createUnionType } from '@nestjs/graphql';
import { User } from '../user/models/user.model';
import { Invitation } from './models/invitation.model';

export const CompanyMemberUnion = createUnionType({
  name: 'CompanyMember',
  types: () => [Invitation, User] as const,
  resolveType(value) {
    if ('authUserId' in value || 'companyId' in value) return User;

    if ('status' in value && !('authUserId' in value)) return Invitation;

    return null;
  },
});
