import { SetMetadata } from '@nestjs/common';

export const ALLOW_UNREGISTERED_APP_USER_KEY = 'allowUnregisteredAppUser';

/**
 * Valid Supabase JWT is enough; a Prisma `users` row may be missing (e.g. user
 * was invited but has not accepted yet). Other routes still require a profile.
 */
export const AllowUnregisteredAppUser = () =>
  SetMetadata(ALLOW_UNREGISTERED_APP_USER_KEY, true);
