import { evaluateCanonicalFis, type FisResult } from "./engine";
import { OUTPUT_CLASS_LABELS, classifyScore, deviationMembershipSet, directValueMembershipSet } from "./variableSets";

// FUZZY.md §5.B — Gidrogenerator.
//
// Preprocessing (FIS emas, oddiy formula): xom uch fazali o'lchovlardan
// P (faol quvvat) va Q (reaktiv quvvat) hisoblanadi. Aniq koeffitsient/birlik
// konversiyasi to'liq dissertatsiya matnida (120 bet) berilgan bo'lishi
// mumkin — bizda faqat avtoreferat bor, shuning uchun bu yerda fizik
// jihatdan asosli, soddalashtirilgan taxminiy formula ishlatilgan
// (test/default, keyinchalik aniqlashtiriladi).

export interface GeneratorElectricalRaw {
  IA: number;
  IB: number;
  IC: number;
  UA: number;
  UB: number;
  UC: number;
  cosPhi: number;
  sinPhi: number;
  R60: number;
  R15: number;
}

export function computeActivePower(raw: GeneratorElectricalRaw): number {
  return (raw.UA * raw.IA + raw.UB * raw.IB + raw.UC * raw.IC) * raw.cosPhi;
}

export function computeReactivePower(raw: GeneratorElectricalRaw): number {
  return (raw.UA * raw.IA + raw.UB * raw.IB + raw.UC * raw.IC) * raw.sinPhi;
}

export function computeAbsorptionCoefficient(raw: GeneratorElectricalRaw): number {
  return raw.R60 / raw.R15;
}

export interface GeneratorElectricalNominal {
  pNominal: number;
  qNominal: number;
}

/** f1 — Elektr qism: kirish 3 ta (K_abs, P, Q), FUZZY.md §5.B. */
export function assessGeneratorElectrical(
  raw: GeneratorElectricalRaw,
  nominal: GeneratorElectricalNominal,
): FisResult {
  const kAbs = computeAbsorptionCoefficient(raw);
  const activePower = computeActivePower(raw);
  const reactivePower = computeReactivePower(raw);

  const variableSets = {
    // K_abs — katta qiymat yaxshi (>1.3 normal, <1.0 xavfli).
    kAbs: directValueMembershipSet([0.8, 1.0, 1.3, 1.6, 2.0], ["juda_yomon", "yomon", "ortacha", "yaxshi", "alo"]),
    activePower: deviationMembershipSet(nominal.pNominal, [0, 0.1, 0.2, 0.3, 0.5]),
    reactivePower: deviationMembershipSet(nominal.qNominal, [0, 0.1, 0.2, 0.3, 0.5]),
  };

  return evaluateCanonicalFis({ kAbs, activePower, reactivePower }, variableSets);
}

export interface GeneratorNonElectricalInput {
  statorHarorati: number; // T_stat, °C
  tebranish: number; // mm/s
}

/** f2 — Noelektr qism: kirish 2 ta (T_stat, tebranish), FUZZY.md §5.B. */
export function assessGeneratorNonElectrical(input: GeneratorNonElectricalInput): FisResult {
  const variableSets = {
    statorHarorati: directValueMembershipSet([60, 75, 90, 105, 120]),
    tebranish: directValueMembershipSet([0.3, 1, 2, 3.5, 5]),
  };
  return evaluateCanonicalFis(
    { statorHarorati: input.statorHarorati, tebranish: input.tebranish },
    variableSets,
  );
}

export interface GeneratorAssessmentResult {
  f1: FisResult;
  f2: FisResult;
  fGgScore: number;
  fGgStatus: string;
}

/**
 * F_gg = sqrt(f1 * f2) — deterministik, FIS EMAS (FUZZY.md §1, "Qatlam 2").
 */
export function assessGenerator(
  electricalRaw: GeneratorElectricalRaw,
  electricalNominal: GeneratorElectricalNominal,
  nonElectrical: GeneratorNonElectricalInput,
): GeneratorAssessmentResult {
  const f1 = assessGeneratorElectrical(electricalRaw, electricalNominal);
  const f2 = assessGeneratorNonElectrical(nonElectrical);
  const fGgScore = Math.round(Math.sqrt(f1.score * f2.score) * 100) / 100;

  return {
    f1,
    f2,
    fGgScore,
    fGgStatus: OUTPUT_CLASS_LABELS[classifyScore(fGgScore)],
  };
}
