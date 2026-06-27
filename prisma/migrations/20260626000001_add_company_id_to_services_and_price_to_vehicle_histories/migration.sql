-- Add company_id to services table
ALTER TABLE "public"."services"
  ADD COLUMN "company_id" BIGINT REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "index_services_on_company_id" ON "public"."services"("company_id");

-- Add price to vehicle_histories table
ALTER TABLE "public"."vehicle_histories"
  ADD COLUMN "price" DECIMAL;
