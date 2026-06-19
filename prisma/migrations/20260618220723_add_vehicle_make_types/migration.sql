-- CreateTable
CREATE TABLE "public"."vehicle_make_types" (
    "id" BIGSERIAL NOT NULL,
    "vehicle_make_id" INTEGER NOT NULL,
    "vehicle_type" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT now(),

    CONSTRAINT "vehicle_make_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_vehicle_make_types" ON "public"."vehicle_make_types"("vehicle_make_id", "vehicle_type");

-- CreateIndex
CREATE INDEX "index_vehicle_make_types_on_vehicle_make_id" ON "public"."vehicle_make_types"("vehicle_make_id");

-- CreateIndex
CREATE INDEX "index_vehicle_make_types_on_vehicle_type" ON "public"."vehicle_make_types"("vehicle_type");

-- AddForeignKey
ALTER TABLE "public"."vehicle_make_types" ADD CONSTRAINT "fk_vehicle_make_types_make" FOREIGN KEY ("vehicle_make_id") REFERENCES "public"."vehicle_makes"("vehicle_make_id") ON DELETE CASCADE ON UPDATE NO ACTION;
