import prisma from "../config/prisma";
import type { EquipmentType } from "@prisma/client";

// FUZZY.md §7 "equipment_metadata" — nominal/statik qiymatlar. Bir
// (aggregateId, equipmentType, paramName) uchun bitta joriy qiymat
// saqlanadi (yangilanganda ustiga yoziladi).

export async function upsertStaticParam(
  aggregateId: number,
  equipmentType: EquipmentType,
  paramName: string,
  paramValue: number,
  options: { unit?: string; paramType?: string } = {},
): Promise<void> {
  await prisma.equipmentStaticParam.upsert({
    where: { aggregateId_equipmentType_paramName: { aggregateId, equipmentType, paramName } },
    create: {
      aggregateId,
      equipmentType,
      paramName,
      paramValue,
      unit: options.unit,
      paramType: options.paramType ?? "nominal",
    },
    update: {
      paramValue,
      unit: options.unit,
      paramType: options.paramType ?? "nominal",
    },
  });
}

export async function getStaticParams(
  aggregateId: number,
  equipmentType: EquipmentType,
): Promise<Record<string, number>> {
  const rows = await prisma.equipmentStaticParam.findMany({
    where: { aggregateId, equipmentType },
    select: { paramName: true, paramValue: true },
  });
  const result: Record<string, number> = {};
  for (const row of rows) result[row.paramName] = row.paramValue;
  return result;
}
