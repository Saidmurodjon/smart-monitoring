import prisma from "../../config/prisma";
import { assessTurbine, type TurbineInput, type TurbineNominal } from "../fuzzyEngine/turbine";

export interface TurbineAssessmentResult {
  assessmentId: number;
  score: number;
  status: string;
  firedRules: Array<{ outputClass: string; label: string; strength: number }>;
}

export async function runTurbineAssessment(
  aggregateId: number,
  input: TurbineInput,
  nominal: TurbineNominal,
): Promise<TurbineAssessmentResult> {
  const result = assessTurbine(input, nominal);

  const saved = await prisma.fuzzyAssessment.create({
    data: {
      aggregateId,
      equipmentType: "TURBINE",
      assessmentType: "Fgt",
      healthScore: result.score,
      healthStatus: result.status,
      inputParameters: { ...input, ...nominal },
      firedRules: result.firedRules,
    },
  });

  return {
    assessmentId: saved.id,
    score: result.score,
    status: result.status,
    firedRules: result.firedRules,
  };
}
