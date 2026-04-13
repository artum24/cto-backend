import { registerEnumType } from '@nestjs/graphql';

export enum UserRoles {
  ADMIN = 1,
  USER = 2,
}

registerEnumType(UserRoles, {
  name: 'UserRoles',
  description: 'Possible user roles',
  valuesMap: {
    ADMIN: { description: 'Admin role' },
    USER: { description: 'User role' },
  },
});
