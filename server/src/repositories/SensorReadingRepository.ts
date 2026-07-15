import prisma from "../config/prisma";
import type { EquipmentType } from "@prisma/client";

// FUZZY.md §7 "sensor_data" — TimescaleDB hypertable (sensor_readings).

export interface ReadingInput {
  paramName: string;
  value: number;
  unit?: string;
}

export async function insertReadings(
  aggregateId: number,
  equipmentType: EquipmentType,
  readings: readonly ReadingInput[],
): Promise<number> {
  const result = await prisma.sensorReading.createMany({
    data: readings.map((reading) => ({
      aggregateId,
      equipmentType,
      paramName: reading.paramName,
      value: reading.value,
      unit: reading.unit,
    })),
  });
  return result.count;
}

/** Har bir `paramName` uchun eng so'nggi (vaqt bo'yicha) qiymatni oladi. */
export async function getLatestReadings(
  aggregateId: number,
  equipmentType: EquipmentType,
  paramNames: readonly string[],
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  await Promise.all(
    paramNames.map(async (paramName) => {
      const row = await prisma.sensorReading.findFirst({
        where: { aggregateId, equipmentType, paramName },
        orderBy: { recordedAt: "desc" },
        select: { value: true },
      });
      if (row) result[paramName] = row.value;
    }),
  );
  return result;
}
