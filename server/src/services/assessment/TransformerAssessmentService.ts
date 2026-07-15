import winston from "winston";
import prisma from "../../config/prisma";
import {
  assessTransformer,
  assessTransformerFromDb,
  type InsulationResistance,
  type TransformerAssessmentResult,
  type TransformerNonElectricalInput,
  type WindingResistance,
} from "../fuzzyEngine/transformer";
import { OUTPUT_CLASS_LABELS, classifyScore } from "../fuzzyEngine/variableSets";
import { getStaticParams } from "../../repositories/EquipmentStaticParamRepository";
import { getLatestReadings } from "../../repositories/SensorReadingRepository";

// f3/f4 (chulg'am, izolyatsiya) FUZZY.md §2'ga ko'ra TO'LIQ statik —
// megger/absorbtsiya o'lchovlari doimiy sensor emas, davriy texnik xizmat
// natijasi. Shu sabab "actual" (hozirgi o'lchov) ham statik jadvalda
// saqlanadi, "Actual" qo'shimchasi bilan nominal qiymatdan ajratiladi.
const WINDING_NOMINAL_STATIC_PARAMS = ["ryuqAB", "ryuqBC", "ryuqCA", "rnnA", "rnnB", "rnnC"] as const;
const WINDING_ACTUAL_STATIC_PARAMS = [
  "ryuqABActual",
  "ryuqBCActual",
  "ryuqCAActual",
  "rnnAActual",
  "rnnBActual",
  "rnnCActual",
] as const;
const INSULATION_STATIC_PARAMS = ["rizol1", "rizol2", "rizol3", "kAbs1", "kAbs2", "kAbs3"] as const;
// f6 (transformatorning noelektr qismi) — haqiqiy real-vaqt sensorlar.
const NON_ELECTRICAL_DYNAMIC_PARAMS = ["transformatorHarorati", "tebranish"] as const;

export interface TransformerAssessmentResponse {
  f3: { assessmentId: number; score: number; status: string };
  f4: { assessmentId: number; score: number; status: string };
  f5: { assessmentId: number; score: number; status: string };
  f6: { assessmentId: number; score: number; status: string };
  fTr: { assessmentId: number; score: number; status: string };
}

/** Turbina uchun ishlatilgan xuddi shu DB-birinchi/kod-fallback naqshi. */
async function assessWithFallback(
  windingActual: WindingResistance,
  windingNominal: WindingResistance,
  insulation: InsulationResistance,
  nonElectrical: TransformerNonElectricalInput,
): Promise<TransformerAssessmentResult> {
  try {
    return await assessTransformerFromDb(
      { actual: windingActual, nominal: windingNominal },
      insulation,
      nonElectrical,
    );
  } catch (err) {
    winston.warn("Transformator (f3-f6): DB qoidalari ishlatilmadi, kod ichidagi default FIS'ga qaytildi", {
      error: err instanceof Error ? err.message : String(err),
    });
    return assessTransformer({ actual: windingActual, nominal: windingNominal }, insulation, nonElectrical);
  }
}

export async function runTransformerAssessment(
  aggregateId: number,
  windingActual: WindingResistance,
  windingNominal: WindingResistance,
  insulation: InsulationResistance,
  nonElectrical: TransformerNonElectricalInput,
): Promise<TransformerAssessmentResponse> {
  const { f3, f4, f5, f6, fTrScore } = await assessWithFallback(
    windingActual,
    windingNominal,
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

/** `TurbineAssessmentService.runTurbineAssessmentFromStoredData`ga o'xshash. */
export async function runTransformerAssessmentFromStoredData(
  aggregateId: number,
): Promise<TransformerAssessmentResponse> {
  const [nonElectricalLatest, staticParams] = await Promise.all([
    getLatestReadings(aggregateId, "TRANSFORMER", NON_ELECTRICAL_DYNAMIC_PARAMS),
    getStaticParams(aggregateId, "TRANSFORMER"),
  ]);

  const missing = [
    ...NON_ELECTRICAL_DYNAMIC_PARAMS.filter((p) => nonElectricalLatest[p] === undefined).map((p) => `sensor:${p}`),
    ...WINDING_NOMINAL_STATIC_PARAMS.filter((p) => staticParams[p] === undefined).map((p) => `nominal:${p}`),
    ...WINDING_ACTUAL_STATIC_PARAMS.filter((p) => staticParams[p] === undefined).map((p) => `actual:${p}`),
    ...INSULATION_STATIC_PARAMS.filter((p) => staticParams[p] === undefined).map((p) => `izolyatsiya:${p}`),
  ];
  if (missing.length > 0) {
    throw new Error(`Baholash uchun quyidagi ma'lumotlar yetishmayapti: ${missing.join(", ")}`);
  }

  return runTransformerAssessment(
    aggregateId,
    {
      ryuqAB: staticParams.ryuqABActual,
      ryuqBC: staticParams.ryuqBCActual,
      ryuqCA: staticParams.ryuqCAActual,
      rnnA: staticParams.rnnAActual,
      rnnB: staticParams.rnnBActual,
      rnnC: staticParams.rnnCActual,
    },
    {
      ryuqAB: staticParams.ryuqAB,
      ryuqBC: staticParams.ryuqBC,
      ryuqCA: staticParams.ryuqCA,
      rnnA: staticParams.rnnA,
      rnnB: staticParams.rnnB,
      rnnC: staticParams.rnnC,
    },
    {
      rizol1: staticParams.rizol1,
      rizol2: staticParams.rizol2,
      rizol3: staticParams.rizol3,
      kAbs1: staticParams.kAbs1,
      kAbs2: staticParams.kAbs2,
      kAbs3: staticParams.kAbs3,
    },
    {
      transformatorHarorati: nonElectricalLatest.transformatorHarorati,
      tebranish: nonElectricalLatest.tebranish,
    },
  );
}
