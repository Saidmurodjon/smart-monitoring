-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('TURBINE', 'GENERATOR', 'TRANSFORMER');

-- CreateTable
CREATE TABLE "fuzzy_assessments" (
    "id" SERIAL NOT NULL,
    "aggregateId" INTEGER NOT NULL,
    "equipmentType" "EquipmentType" NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "healthScore" DOUBLE PRECISION NOT NULL,
    "healthStatus" TEXT NOT NULL,
    "inputParameters" JSONB,
    "firedRules" JSONB,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuzzy_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fuzzy_assessments_aggregateId_equipmentType_assessmentType_idx" ON "fuzzy_assessments"("aggregateId", "equipmentType", "assessmentType");

-- AddForeignKey
ALTER TABLE "fuzzy_assessments" ADD CONSTRAINT "fuzzy_assessments_aggregateId_fkey" FOREIGN KEY ("aggregateId") REFERENCES "aggregates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
