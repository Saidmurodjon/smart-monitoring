import prisma from "../../config/prisma";
import {
  assessTransformer,
  type InsulationResistance,
  type TransformerNonElectricalInput,
  type WindingResistance,
} from "../fuzzyEngine/transformer";
import { OUTPUT_CLASS_LABELS, classifyScore } from "../fuzzyEngine/variableSets";

export interface TransformerAssessmentResponse {
  f3: { assessmentId: number; score: number; status: string };
  f4: { assessmentId: number; score: number; status: string };
  f5: { assessmentId: number; score: number; status: string };
  f6: { assessmentId: number; score: number; status: string };
  fTr: { assessmentId: number; score: number; status: string };
}

export async function runTransformerAssessment(
  aggregateId: number,
  windingActual: WindingResistance,
  windingNominal: WindingResistance,
  insulation: InsulationResistance,
  nonElectrical: TransformerNonElectricalInput,
): Promise<TransformerAssessmentResponse> {
  const { f3, f4, f5, f6, fTrScore } = assessTransformer(
    { actual: windingActual, nominal: windingNominal },
    insulation,
    nonElectrical,
  );
  const fTrStatus = OUTPUT_CLASS_LABELS[classifyScore(fTrScore)];

  const [f3Row, f4Row, f5Row, f6Row, fTrRow] = await prisma.$transaction([
    prisma.fuzzyAssessment.create({
      data: {
        aggregateId,
        equipmentType: "TRANSFORMER",
        assessmentType: "f3",
        healthScore: f3.score,
        healthStatus: f3.status,
        inputParameters: { ...windingActual, nominal: windingNominal },
        firedRules: f3.firedRules,
      },
    }),
    prisma.fuzzyAssessment.create({
      data: {
        aggregateId,
        equipmentType: "TRANSFORMER",
        assessmentType: "f4",
        healthScore: f4.score,
        healthStatus: f4.status,
        inputParameters: { ...insulation },
        firedRules: f4.firedRules,
      },
    }),
    prisma.fuzzyAssessment.create({
      data: {
        aggregateId,
        equipmentType: "TRANSFORMER",
        assessmentType: "f5",
        healthScore: f5.score,
        healthStatus: f5.status,
        inputParameters: { f3Score: f3.score, f4Score: f4.score },
        firedRules: f5.firedRules,
      },
    }),
    prisma.fuzzyAssessment.create({
      data: {
        aggregateId,
        equipmentType: "TRANSFORMER",
        assessmentType: "f6",
        healthScore: f6.score,
        healthStatus: f6.status,
        inputParameters: { ...nonElectrical },
        firedRules: f6.firedRules,
      },
    }),
    prisma.fuzzyAssessment.create({
      data: {
        aggregateId,
        equipmentType: "TRANSFORMER",
        assessmentType: "F_tr",
        healthScore: fTrScore,
        healthStatus: fTrStatus,
        inputParameters: { f5Score: f5.score, f6Score: f6.score },
        firedRules: [],
      },
    }),
  ]);

  return {
    f3: { assessmentId: f3Row.id, score: f3.score, status: f3.status },
    f4: { assessmentId: f4Row.id, score: f4.score, status: f4.status },
    f5: { assessmentId: f5Row.id, score: f5.score, status: f5.status },
    f6: { assessmentId: f6Row.id, score: f6.score, status: f6.status },
    fTr: { assessmentId: fTrRow.id, score: fTrScore, status: fTrStatus },
  };
}
