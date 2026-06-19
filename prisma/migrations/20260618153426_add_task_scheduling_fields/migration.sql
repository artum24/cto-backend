/*
  Warnings:

  - You are about to alter the column `vehicle_make_id` on the `vehicle_makes` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `vehicle_model_id` on the `vehicle_models` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `vehicle_make_id` on the `vehicle_models` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "public"."vehicle_models" DROP CONSTRAINT "fk_rails_d0bef20deb";

-- AlterTable
ALTER TABLE "public"."reports" ADD COLUMN     "company_id" BIGINT;

-- AlterTable
ALTER TABLE "public"."services" ADD COLUMN     "price" DECIMAL;

-- AlterTable
ALTER TABLE "public"."tasks" ADD COLUMN     "end_time" TIMESTAMP(6),
ADD COLUMN     "performer_id" UUID,
ADD COLUMN     "start_time" TIMESTAMP(6),
ADD COLUMN     "workspace_id" BIGINT;

-- AlterTable
ALTER TABLE "public"."vehicle_makes" ALTER COLUMN "vehicle_make_id" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."vehicle_models" ALTER COLUMN "vehicle_model_id" SET DATA TYPE INTEGER,
ALTER COLUMN "vehicle_make_id" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "public"."suppliers" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact_person" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "company_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" BIGSERIAL NOT NULL,
    "task_id" BIGINT NOT NULL,
    "total_amount" DECIMAL NOT NULL,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_task_id_key" ON "public"."invoices"("task_id");

-- CreateIndex
CREATE INDEX "index_invoices_on_task_id" ON "public"."invoices"("task_id");

-- AddForeignKey
ALTER TABLE "public"."suppliers" ADD CONSTRAINT "suppliers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_performer_id_fkey" FOREIGN KEY ("performer_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."vehicle_models" ADD CONSTRAINT "fk_rails_d0bef20deb" FOREIGN KEY ("vehicle_make_id") REFERENCES "public"."vehicle_makes"("vehicle_make_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
