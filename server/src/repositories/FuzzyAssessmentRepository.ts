import prisma from "../config/prisma";
import type { EquipmentType } from "@prisma/client";

// .claude/rules/architecture.md: Repository faqat ma'lumotlar bazasi bilan
// ishlaydi. Hozircha faqat GES-darajasidagi FIS uchun kerak bo'lgan "o'qish"
// tomoni bor — Turbine/Generator/Transformer servislaridagi ko'p qatorli
// atomik yozuvlar ($transaction) hozircha o'zlarida qoldirilgan.

export async function findLatestScore(
  aggregateId: number,
  equipmentType: EquipmentType,
  assessmentType: string,
): Promise<number | null> {
  const row = await prisma.fuzzyAssessment.findFirst({
    where: { aggregateId, equipmentType, assessmentType },
    orderBy: { assessedAt: "desc" },
    select: { healthScore: true },
  });
  return row?.healthScore ?? null;
}

export interface LatestAssessmentRow {
  equipmentType: EquipmentType;
  assessmentType: string;
  healthScore: number;
  healthStatus: string;
  assessedAt: Date;
}

/**
 * Har bir (equipmentType, assessmentType) juftligi uchun eng so'nggi
 * yozuvni bitta so'rovda oladi — dashboard/GES sahifalarida hozirgi
 * holatni ko'rsatish uchun (Fgt, f1, f2, F_gg, f3, f4, f5, f6, F_tr, GES).
 */
export async function findLatestAssessmentsForAggregate(aggregateId: number): Promise<LatestAssessmentRow[]> {
  const rows = await prisma.fuzzyAssessment.findMany({
    where: { aggregateId },
    distinct: ["equipmentType", "assessmentType"],
    orderBy: { assessedAt: "desc" },
    select: { equipmentType: true, assessmentType: true, healthScore: true, healthStatus: true, assessedAt: true },
  });
  return rows;
}
