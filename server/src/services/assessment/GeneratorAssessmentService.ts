import prisma from "../../config/prisma";
import {
  assessGenerator,
  type GeneratorElectricalNominal,
  type GeneratorElectricalRaw,
  type GeneratorNonElectricalInput,
} from "../fuzzyEngine/generator";
import { getStaticParams } from "../../repositories/EquipmentStaticParamRepository";
import { getLatestReadings } from "../../repositories/SensorReadingRepository";

const DYNAMIC_PARAMS = ["IA", "IB", "IC", "UA", "UB", "UC", "cosPhi", "sinPhi", "statorHarorati", "tebranish"] as const;
const STATIC_PARAMS = ["R60", "R15", "pNominal", "qNominal"] as const;

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

/** `TurbineAssessmentService.runTurbineAssessmentFromStoredData`ga o'xshash. */
export async function runGeneratorAssessmentFromStoredData(
  aggregateId: number,
): Promise<GeneratorAssessmentResponse> {
  const [latest, nominal] = await Promise.all([
    getLatestReadings(aggregateId, "GENERATOR", DYNAMIC_PARAMS),
    getStaticParams(aggregateId, "GENERATOR"),
  ]);

  const missing = [
    ...DYNAMIC_PARAMS.filter((p) => latest[p] === undefined).map((p) => `sensor:${p}`),
    ...STATIC_PARAMS.filter((p) => nominal[p] === undefined).map((p) => `nominal:${p}`),
  ];
  if (missing.length > 0) {
    throw new Error(`Baholash uchun quyidagi ma'lumotlar yetishmayapti: ${missing.join(", ")}`);
  }

  return runGeneratorAssessment(
    aggregateId,
    {
      IA: latest.IA,
      IB: latest.IB,
      IC: latest.IC,
      UA: latest.UA,
      UB: latest.UB,
      UC: latest.UC,
      cosPhi: latest.cosPhi,
      sinPhi: latest.sinPhi,
      R60: nominal.R60,
      R15: nominal.R15,
    },
    { pNominal: nominal.pNominal, qNominal: nominal.qNominal },
    { statorHarorati: latest.statorHarorati, tebranish: latest.tebranish },
  );
}
