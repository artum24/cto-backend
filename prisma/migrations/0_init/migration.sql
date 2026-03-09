-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "public"."active_storage_attachments" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "record_type" VARCHAR NOT NULL,
    "record_id" BIGINT NOT NULL,
    "blob_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "active_storage_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."active_storage_blobs" (
    "id" BIGSERIAL NOT NULL,
    "key" VARCHAR NOT NULL,
    "filename" VARCHAR NOT NULL,
    "content_type" VARCHAR,
    "metadata" TEXT,
    "service_name" VARCHAR NOT NULL,
    "byte_size" BIGINT NOT NULL,
    "checksum" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "active_storage_blobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."active_storage_variant_records" (
    "id" BIGSERIAL NOT NULL,
    "blob_id" BIGINT NOT NULL,
    "variation_digest" VARCHAR NOT NULL,

    CONSTRAINT "active_storage_variant_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ar_internal_metadata" (
    "key" VARCHAR NOT NULL,
    "value" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ar_internal_metadata_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR,
    "storage_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(6),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR,
    "phone" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "company_id" BIGINT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR,
    "company_type" INTEGER,
    "city" VARCHAR,
    "address" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "city_ref" VARCHAR,
    "address_ref" VARCHAR,
    "house_number" VARCHAR,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."detail_histories" (
    "id" BIGSERIAL NOT NULL,
    "action_type" INTEGER,
    "count_diff" INTEGER,
    "count_result" INTEGER,
    "comment" VARCHAR,
    "user_id" UUID NOT NULL,
    "detail_id" BIGINT NOT NULL,
    "task_id" BIGINT,
    "storage_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "detail_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."details" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR,
    "article" VARCHAR,
    "count" INTEGER,
    "minimum_count" INTEGER,
    "suplier_id" BIGINT,
    "category_id" BIGINT,
    "storage_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(6),
    "sell_price" DECIMAL,
    "buy_price" DECIMAL,

    CONSTRAINT "details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "email" VARCHAR,
    "company_id" BIGINT NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" BIGSERIAL NOT NULL,
    "job_id" VARCHAR,
    "data_errors" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schema_migrations" (
    "version" VARCHAR NOT NULL,

    CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR,
    "description" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."storages" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR,
    "company_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "storages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supliers" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR,
    "phone" VARCHAR,
    "email" VARCHAR,
    "site_url" VARCHAR,
    "comment" VARCHAR,
    "storage_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "suplier_name" VARCHAR,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(6),

    CONSTRAINT "supliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tasks" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR,
    "status" INTEGER NOT NULL,
    "vehicle_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."uploads" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" BIGINT NOT NULL,
    "role" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "auth_user_id" UUID NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 2,
    "email" VARCHAR,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vehicle_histories" (
    "id" BIGSERIAL NOT NULL,
    "distance" INTEGER,
    "status" VARCHAR,
    "task_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "service_id" BIGINT NOT NULL,

    CONSTRAINT "vehicle_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vehicle_makes" (
    "id" BIGSERIAL NOT NULL,
    "vehicle_make_id" BIGINT NOT NULL,
    "vehicle_make_name" VARCHAR NOT NULL,
    "vehicle_type" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "vehicle_makes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vehicle_models" (
    "id" BIGSERIAL NOT NULL,
    "vehicle_model_id" BIGINT NOT NULL,
    "vehicle_model_name" VARCHAR NOT NULL,
    "vehicle_type" INTEGER NOT NULL,
    "vehicle_make_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "vehicle_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vehicles" (
    "id" BIGSERIAL NOT NULL,
    "vehicle_year" INTEGER NOT NULL,
    "vehicle_distance" INTEGER,
    "vehicle_number" VARCHAR,
    "vehicle_vin_code" VARCHAR,
    "vehicle_transmission" VARCHAR,
    "client_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "vehicle_type" INTEGER,
    "vehicle_make_id" BIGINT,
    "vehicle_model_id" BIGINT,
    "vehicle_make_name" VARCHAR,
    "vehicle_model_name" VARCHAR,
    "archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workspaces" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR,
    "company_id" BIGINT NOT NULL,
    "number" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "index_active_storage_attachments_on_blob_id" ON "public"."active_storage_attachments"("blob_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_active_storage_attachments_uniqueness" ON "public"."active_storage_attachments"("record_type", "record_id", "name", "blob_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_active_storage_blobs_on_key" ON "public"."active_storage_blobs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "index_active_storage_variant_records_uniqueness" ON "public"."active_storage_variant_records"("blob_id", "variation_digest");

-- CreateIndex
CREATE INDEX "index_categories_on_storage_id" ON "public"."categories"("storage_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_categories_on_name_and_storage_id" ON "public"."categories"("name", "storage_id");

-- CreateIndex
CREATE INDEX "index_clients_on_company_id" ON "public"."clients"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_clients_on_company_id_and_phone" ON "public"."clients"("company_id", "phone");

-- CreateIndex
CREATE INDEX "index_detail_histories_on_detail_id" ON "public"."detail_histories"("detail_id");

-- CreateIndex
CREATE INDEX "index_detail_histories_on_storage_id" ON "public"."detail_histories"("storage_id");

-- CreateIndex
CREATE INDEX "index_detail_histories_on_task_id" ON "public"."detail_histories"("task_id");

-- CreateIndex
CREATE INDEX "index_detail_histories_on_user_id" ON "public"."detail_histories"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_details_on_article" ON "public"."details"("article");

-- CreateIndex
CREATE INDEX "index_details_on_category_id" ON "public"."details"("category_id");

-- CreateIndex
CREATE INDEX "index_details_on_count" ON "public"."details"("count");

-- CreateIndex
CREATE INDEX "index_details_on_storage_id" ON "public"."details"("storage_id");

-- CreateIndex
CREATE INDEX "index_details_on_suplier_id" ON "public"."details"("suplier_id");

-- CreateIndex
CREATE INDEX "index_invitations_on_company_id" ON "public"."invitations"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_reports_on_job_id" ON "public"."reports"("job_id");

-- CreateIndex
CREATE INDEX "index_storages_on_company_id" ON "public"."storages"("company_id");

-- CreateIndex
CREATE INDEX "index_supliers_on_storage_id" ON "public"."supliers"("storage_id");

-- CreateIndex
CREATE INDEX "index_tasks_on_vehicle_id" ON "public"."tasks"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_users_on_auth_user_id" ON "public"."users"("auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_users_on_email" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "index_users_on_company_id" ON "public"."users"("company_id");

-- CreateIndex
CREATE INDEX "index_vehicle_histories_on_service_id" ON "public"."vehicle_histories"("service_id");

-- CreateIndex
CREATE INDEX "index_vehicle_histories_on_task_id" ON "public"."vehicle_histories"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_vehicle_makes_on_vehicle_make_id" ON "public"."vehicle_makes"("vehicle_make_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_vehicle_models_on_vehicle_model_id" ON "public"."vehicle_models"("vehicle_model_id");

-- CreateIndex
CREATE INDEX "index_vehicle_models_on_vehicle_make_id" ON "public"."vehicle_models"("vehicle_make_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_vehicles_on_vehicle_number" ON "public"."vehicles"("vehicle_number");

-- CreateIndex
CREATE INDEX "index_vehicles_on_client_id" ON "public"."vehicles"("client_id");

-- CreateIndex
CREATE INDEX "index_vehicles_on_vehicle_distance" ON "public"."vehicles"("vehicle_distance");

-- CreateIndex
CREATE INDEX "index_vehicles_on_vehicle_make_id" ON "public"."vehicles"("vehicle_make_id");

-- CreateIndex
CREATE INDEX "index_vehicles_on_vehicle_model_id" ON "public"."vehicles"("vehicle_model_id");

-- CreateIndex
CREATE INDEX "index_vehicles_on_vehicle_year" ON "public"."vehicles"("vehicle_year");

-- CreateIndex
CREATE INDEX "index_workspaces_on_company_id" ON "public"."workspaces"("company_id");

-- AddForeignKey
ALTER TABLE "public"."active_storage_attachments" ADD CONSTRAINT "fk_rails_c3b3935057" FOREIGN KEY ("blob_id") REFERENCES "public"."active_storage_blobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."active_storage_variant_records" ADD CONSTRAINT "fk_rails_993965df05" FOREIGN KEY ("blob_id") REFERENCES "public"."active_storage_blobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "fk_rails_8c8584bd5f" FOREIGN KEY ("storage_id") REFERENCES "public"."storages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "fk_rails_db0f958971" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."detail_histories" ADD CONSTRAINT "fk_rails_1b86a3ac9e" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."detail_histories" ADD CONSTRAINT "fk_rails_2426616090" FOREIGN KEY ("detail_id") REFERENCES "public"."details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."detail_histories" ADD CONSTRAINT "fk_rails_6c4dcab13f" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."detail_histories" ADD CONSTRAINT "fk_rails_867a758e61" FOREIGN KEY ("storage_id") REFERENCES "public"."storages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."details" ADD CONSTRAINT "fk_rails_1d3acaa439" FOREIGN KEY ("storage_id") REFERENCES "public"."storages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."details" ADD CONSTRAINT "fk_rails_3e6fda7e39" FOREIGN KEY ("suplier_id") REFERENCES "public"."supliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."details" ADD CONSTRAINT "fk_rails_7eb8d15839" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "fk_rails_f16e5a18d7" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."storages" ADD CONSTRAINT "fk_rails_2d2240b84c" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."supliers" ADD CONSTRAINT "fk_rails_a0f33fc780" FOREIGN KEY ("storage_id") REFERENCES "public"."storages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "fk_rails_e6342a7e7d" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "fk_rails_7682a3bdfe" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."vehicle_histories" ADD CONSTRAINT "fk_rails_077266b3b2" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."vehicle_histories" ADD CONSTRAINT "fk_rails_bac9cf93bb" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."vehicle_models" ADD CONSTRAINT "fk_rails_d0bef20deb" FOREIGN KEY ("vehicle_make_id") REFERENCES "public"."vehicle_makes"("vehicle_make_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."vehicles" ADD CONSTRAINT "fk_rails_71757241f0" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."vehicles" ADD CONSTRAINT "fk_rails_83f60c4d50" FOREIGN KEY ("vehicle_model_id") REFERENCES "public"."vehicle_models"("vehicle_model_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."vehicles" ADD CONSTRAINT "fk_rails_ebbfd13f29" FOREIGN KEY ("vehicle_make_id") REFERENCES "public"."vehicle_makes"("vehicle_make_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."workspaces" ADD CONSTRAINT "fk_rails_722962e7d3" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

