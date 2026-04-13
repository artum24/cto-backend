-- "count" on categories can trigger Postgres 42803 with Prisma/driver/RLS
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'count'
  ) THEN
    ALTER TABLE "public"."categories" RENAME COLUMN "count" TO "parts_count";
  END IF;
END $$;
