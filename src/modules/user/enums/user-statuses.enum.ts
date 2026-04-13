import { registerEnumType } from '@nestjs/graphql';

export enum UserStatuses {
  ACTIVE = 1,
  INVITED = 2,
  REMOVED = 3,
}

registerEnumType(UserStatuses, {
  name: 'UserStatuses',
  description: 'Possible user statuses',
  valuesMap: {
    ACTIVE: { description: 'Active user' },
    INVITED: { description: 'Invited user' },
    REMOVED: { description: 'Removed user' },
  },
});
