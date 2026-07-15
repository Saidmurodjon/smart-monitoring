-- DropIndex
DROP INDEX "sensor_readings_recordedAt_idx";

-- CreateTable
CREATE TABLE "fuzzy_variable_definitions" (
    "id" SERIAL NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "variable" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "centers" JSONB NOT NULL,
    "ascendingOrder" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuzzy_variable_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuzzy_rule_definitions" (
    "id" SERIAL NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "antecedents" JSONB NOT NULL,
    "outputClass" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuzzy_rule_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fuzzy_variable_definitions_assessmentType_variable_key" ON "fuzzy_variable_definitions"("assessmentType", "variable");

-- CreateIndex
CREATE INDEX "fuzzy_rule_definitions_assessmentType_idx" ON "fuzzy_rule_definitions"("assessmentType");
