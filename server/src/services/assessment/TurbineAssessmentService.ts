import prisma from "../../config/prisma";
import { assessTurbine, type TurbineInput, type TurbineNominal } from "../fuzzyEngine/turbine";
import { getStaticParams } from "../../repositories/EquipmentStaticParamRepository";
import { getLatestReadings } from "../../repositories/SensorReadingRepository";

const DYNAMIC_PARAMS = ["aylanishTezligi", "quvvat", "suvSarfi", "tebranish"] as const;
const STATIC_PARAMS = ["aylanishTezligi", "quvvat", "suvSarfi"] as const;

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

/**
 * Xom parametrlarni so'rov body'sida talab qilish o'rniga, DB'da saqlangan
 * eng so'nggi sensor o'qishlari (`sensor_readings`) va nominal statik
 * parametrlarni (`equipment_static_params`) o'qib, shular asosida baholaydi.
 * Bu FUZZY.md §11'dagi haqiqiy real-vaqt oqimiga mos yo'l: MQTT -> DB
 * yozish -> FIS hisoblash (bu funksiya) -> WebSocket push.
 */
export async function runTurbineAssessmentFromStoredData(aggregateId: number): Promise<TurbineAssessmentResult> {
  const [latest, nominal] = await Promise.all([
    getLatestReadings(aggregateId, "TURBINE", DYNAMIC_PARAMS),
    getStaticParams(aggregateId, "TURBINE"),
  ]);

  const missing = [
    ...DYNAMIC_PARAMS.filter((p) => latest[p] === undefined).map((p) => `sensor:${p}`),
    ...STATIC_PARAMS.filter((p) => nominal[p] === undefined).map((p) => `nominal:${p}`),
  ];
  if (missing.length > 0) {
    throw new Error(`Baholash uchun quyidagi ma'lumotlar yetishmayapti: ${missing.join(", ")}`);
  }

  return runTurbineAssessment(
    aggregateId,
    {
      aylanishTezligi: latest.aylanishTezligi,
      quvvat: latest.quvvat,
      suvSarfi: latest.suvSarfi,
      tebranish: latest.tebranish,
    },
    {
      aylanishTezligiNominal: nominal.aylanishTezligi,
      quvvatNominal: nominal.quvvat,
      suvSarfiNominal: nominal.suvSarfi,
    },
  );
}
