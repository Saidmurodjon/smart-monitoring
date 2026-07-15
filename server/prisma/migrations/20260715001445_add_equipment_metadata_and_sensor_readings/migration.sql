-- CreateTable
CREATE TABLE "equipment_static_params" (
    "id" SERIAL NOT NULL,
    "aggregateId" INTEGER NOT NULL,
    "equipmentType" "EquipmentType" NOT NULL,
    "paramName" TEXT NOT NULL,
    "paramValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "paramType" TEXT NOT NULL DEFAULT 'nominal',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_static_params_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_readings" (
    "aggregateId" INTEGER NOT NULL,
    "equipmentType" "EquipmentType" NOT NULL,
    "paramName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("aggregateId","equipmentType","paramName","recordedAt")
);

-- CreateIndex
CREATE UNIQUE INDEX "equipment_static_params_aggregateId_equipmentType_paramName_key" ON "equipment_static_params"("aggregateId", "equipmentType", "paramName");

-- AddForeignKey
ALTER TABLE "equipment_static_params" ADD CONSTRAINT "equipment_static_params_aggregateId_fkey" FOREIGN KEY ("aggregateId") REFERENCES "aggregates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_aggregateId_fkey" FOREIGN KEY ("aggregateId") REFERENCES "aggregates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
