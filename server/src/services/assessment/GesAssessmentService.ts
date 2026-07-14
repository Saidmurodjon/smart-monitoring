import prisma from "../../config/prisma";
import { findLatestScore } from "../../repositories/FuzzyAssessmentRepository";
import { assessGesLevel } from "../fuzzyEngine/ges";

export interface GesAssessmentResult {
  assessmentId: number;
  score: number;
  status: string;
  inputs: { fgt: number; fgg: number; ftr: number };
}

/**
 * GES darajasidagi FIS — avval alohida hisoblangan Fgt (turbina), F_gg
 * (generator) va F_tr (transformator) natijalarini DB'dan o'qib, ularni
 * yakuniy Mamdani FIS'ga kirish sifatida beradi (FUZZY.md "Qatlam 3").
 * Shu sabab bu yerga xom sensor qiymatlari emas, balki `aggregateId`
 * yetarli — lekin uchala jihoz oldindan baholangan bo'lishi shart.
 */
export async function runGesAssessment(aggregateId: number): Promise<GesAssessmentResult> {
  const [fgt, fgg, ftr] = await Promise.all([
    findLatestScore(aggregateId, "TURBINE", "Fgt"),
    findLatestScore(aggregateId, "GENERATOR", "F_gg"),
    findLatestScore(aggregateId, "TRANSFORMER", "F_tr"),
  ]);

  const missing: string[] = [];
  if (fgt === null) missing.push("gidroturbina (Fgt)");
  if (fgg === null) missing.push("gidrogenerator (F_gg)");
  if (ftr === null) missing.push("transformator (F_tr)");
  if (missing.length > 0) {
    throw new Error(
      `GES darajasida baholash uchun avval quyidagilar hisoblanishi kerak: ${missing.join(", ")}`,
    );
  }

  const result = assessGesLevel(fgt as number, fgg as number, ftr as number);

  const saved = await prisma.fuzzyAssessment.create({
    data: {
      aggregateId,
      equipmentType: "GES",
      assessmentType: "GES",
      healthScore: result.score,
      healthStatus: result.status,
      inputParameters: { fgt, fgg, ftr },
      firedRules: result.firedRules,
    },
  });

  return {
    assessmentId: saved.id,
    score: result.score,
    status: result.status,
    inputs: { fgt: fgt as number, fgg: fgg as number, ftr: ftr as number },
  };
}
