-- No-op: Supabase extensions are managed by the platform; this migration exists only to clear failed state.
-- Drift from pg_cron, pg_graphql, pg_net, etc. is expected; always answer N when Prisma asks to reset.
SELECT 1;
