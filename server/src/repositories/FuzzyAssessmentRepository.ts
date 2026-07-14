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
