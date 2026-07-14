import prisma from "../../config/prisma";
import {
  assessGenerator,
  type GeneratorElectricalNominal,
  type GeneratorElectricalRaw,
  type GeneratorNonElectricalInput,
} from "../fuzzyEngine/generator";

export interface GeneratorAssessmentResponse {
  f1: { assessmentId: number; score: number; status: string };
  f2: { assessmentId: number; score: number; status: string };
  fGg: { assessmentId: number; score: number; status: string };
}

export async function runGeneratorAssessment(
  aggregateId: number,
  electricalRaw: GeneratorElectricalRaw,
  electricalNominal: GeneratorElectricalNominal,
  nonElectrical: GeneratorNonElectricalInput,
): Promise<GeneratorAssessmentResponse> {
  const { f1, f2, fGgScore, fGgStatus } = assessGenerator(electricalRaw, electricalNominal, nonElectrical);

  const [f1Row, f2Row, fGgRow] = await prisma.$transaction([
    prisma.fuzzyAssessment.create({
      data: {
        aggregateId,
        equipmentType: "GENERATOR",
        assessmentType: "f1",
        healthScore: f1.score,
        healthStatus: f1.status,
        inputParameters: { ...electricalRaw, ...electricalNominal },
        firedRules: f1.firedRules,
      },
    }),
    prisma.fuzzyAssessment.create({
      data: {
        aggregateId,
        equipmentType: "GENERATOR",
        assessmentType: "f2",
        healthScore: f2.score,
        healthStatus: f2.status,
        inputParameters: { ...nonElectrical },
        firedRules: f2.firedRules,
      },
    }),
    prisma.fuzzyAssessment.create({
      data: {
        aggregateId,
        equipmentType: "GENERATOR",
        assessmentType: "F_gg",
        healthScore: fGgScore,
        healthStatus: fGgStatus,
        inputParameters: { f1Score: f1.score, f2Score: f2.score },
        firedRules: [],
      },
    }),
  ]);

  return {
    f1: { assessmentId: f1Row.id, score: f1.score, status: f1.status },
    f2: { assessmentId: f2Row.id, score: f2.score, status: f2.status },
    fGg: { assessmentId: fGgRow.id, score: fGgScore, status: fGgStatus },
  };
}
