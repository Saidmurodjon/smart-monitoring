import winston from "winston";
import prisma from "../../config/prisma";
import { assessTurbine, assessTurbineFromDb, type TurbineInput, type TurbineNominal } from "../fuzzyEngine/turbine";
import { getStaticParams } from "../../repositories/EquipmentStaticParamRepository";
import { getLatestReadings } from "../../repositories/SensorReadingRepository";
import type { FisResult } from "../fuzzyEngine/engine";

const DYNAMIC_PARAMS = ["aylanishTezligi", "quvvat", "suvSarfi", "tebranish"] as const;
const STATIC_PARAMS = ["aylanishTezligi", "quvvat", "suvSarfi"] as const;

export interface TurbineAssessmentResult {
  assessmentId: number;
  score: number;
  status: string;
  firedRules: Array<{ outputClass: string; label: string; strength: number }>;
}

/**
 * DB'dagi qoidalarni (`fuzzy_variable_definitions`/`fuzzy_rule_definitions`)
 * birinchi navbatda ishlatishga urinadi (.claude/rules/fuzzy-logic.md #2).
 * DB'da hali seed qilinmagan yoki vaqtincha ishlamay qolgan bo'lsa,
 * kod ichidagi DEFAULT FIS'ga (`assessTurbine`) qaytadi — CLAUDE.md #5.3
 * "FIS hisoblashda xatolik yuz bersa, oldingi baholash natijasi (cache)
 * qaytarilsin" ruhiga mos: hisoblash butunlay to'xtab qolmaydi.
 */
async function assessWithFallback(input: TurbineInput, nominal: TurbineNominal): Promise<FisResult> {
  try {
    return await assessTurbineFromDb(input, nominal);
  } catch (err) {
    winston.warn("Fgt: DB qoidalari ishlatilmadi, kod ichidagi default FIS'ga qaytildi", {
      error: err instanceof Error ? err.message : String(err),
    });
    return assessTurbine(input, nominal);
  }
}

export async function runTurbineAssessment(
  aggregateId: number,
  input: TurbineInput,
  nominal: TurbineNominal,
): Promise<TurbineAssessmentResult> {
  const result = await assessWithFallback(input, nominal);

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
