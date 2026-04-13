import type { Prisma } from '@prisma/client';

/**
 * Excludes `partsCount` so the DB column is not read via Prisma SELECT.
 * Avoids Postgres 42803 (GROUP BY / aggregate) with `count`/`parts_count` + some drivers/RLS.
 */
export const categorySelectPublic: Prisma.categoriesSelect = {
  id: true,
  name: true,
  storage_id: true,
  created_at: true,
  updated_at: true,
  archived: true,
  archived_at: true,
};
