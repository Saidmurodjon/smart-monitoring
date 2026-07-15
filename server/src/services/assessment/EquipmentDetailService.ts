import prisma from "../../config/prisma";
import { getStaticParams } from "../../repositories/EquipmentStaticParamRepository";
import { getLatestReadings } from "../../repositories/SensorReadingRepository";
import { getAssessmentSummary, type AssessmentSummary } from "./AssessmentSummaryService";

// FUZZY.md §5 dinamik (sensordan keladigan) kirishlar — statik/nominal
// parametrlar bundan mustasno (ular equipment_static_params'dan keladi).
const DYNAMIC_PARAMS: Record<"TURBINE" | "GENERATOR" | "TRANSFORMER", readonly string[]> = {
  TURBINE: ["aylanishTezligi", "quvvat", "suvSarfi", "tebranish"],
  GENERATOR: ["IA", "IB", "IC", "UA", "UB", "UC", "cosPhi", "sinPhi", "statorHarorati", "tebranish"],
  TRANSFORMER: ["transformatorHarorati", "tebranish"],
};

export interface AggregateDetail {
  id: number;
  gesId: number;
  hydroTurbine: unknown;
  hydroGenerator: unknown;
  transformer: unknown;
  state: string;
  isPublished: boolean;
  staticParams: Record<"TURBINE" | "GENERATOR" | "TRANSFORMER", Record<string, number>>;
  latestReadings: Record<"TURBINE" | "GENERATOR" | "TRANSFORMER", Record<string, number>>;
  assessment: AssessmentSummary;
}

/**
 * Bitta agregat uchun UI'ga kerak bo'lgan hamma narsani bir chaqiruvda
 * qaytaradi: tavsifiy (JSON blob) maydonlar, FIS statik nominal parametrlar,
 * eng so'nggi sensor qiymatlari va eng so'nggi FIS baholash natijalari.
 */
export async function getAggregateDetail(aggregateId: number): Promise<AggregateDetail | null> {
  const aggregate = await prisma.aggregate.findUnique({ where: { id: aggregateId } });
  if (!aggregate) return null;

  const equipmentTypes = ["TURBINE", "GENERATOR", "TRANSFORMER"] as const;

  const [staticEntries, readingEntries, assessment] = await Promise.all([
    Promise.all(equipmentTypes.map((type) => getStaticParams(aggregateId, type))),
    Promise.all(equipmentTypes.map((type) => getLatestReadings(aggregateId, type, DYNAMIC_PARAMS[type]))),
    getAssessmentSummary(aggregateId),
  ]);

  const staticParams = Object.fromEntries(
    equipmentTypes.map((type, i) => [type, staticEntries[i]]),
  ) as AggregateDetail["staticParams"];
  const latestReadings = Object.fromEntries(
    equipmentTypes.map((type, i) => [type, readingEntries[i]]),
  ) as AggregateDetail["latestReadings"];

  return {
    id: aggregate.id,
    gesId: aggregate.gesId,
    hydroTurbine: aggregate.hydroTurbine,
    hydroGenerator: aggregate.hydroGenerator,
    transformer: aggregate.transformer,
    state: aggregate.state,
    isPublished: aggregate.isPublished,
    staticParams,
    latestReadings,
    assessment,
  };
}
