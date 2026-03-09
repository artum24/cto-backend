-- Align vehicles.vehicle_make_id and vehicle_model_id with actual DB (INTEGER).
-- Supabase / Rails may have created these as INTEGER; Prisma expected BIGINT.
ALTER TABLE "public"."vehicles" ALTER COLUMN "vehicle_make_id" SET DATA TYPE INTEGER USING vehicle_make_id::integer;
ALTER TABLE "public"."vehicles" ALTER COLUMN "vehicle_model_id" SET DATA TYPE INTEGER USING vehicle_model_id::integer;
