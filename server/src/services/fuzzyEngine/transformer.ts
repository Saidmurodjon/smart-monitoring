import { evaluateCanonicalFis, type FisResult } from "./engine";
import { deviationMembershipSet, directValueMembershipSet, scoreMembershipSet } from "./variableSets";

// FUZZY.md §5.C — Transformator.
// f3 (chulg'am) va f4 (izolyatsiya) — statik, 6 tadan kirish. f5 = FIS(f3,f4)
// — "Qatlam 1.5", alohida Mamdani FIS bosqichi (oddiy o'rtacha EMAS). f6
// (noelektr) — 2 kirish. F_tr = sqrt(f5 * f6) — deterministik.

const HIGHER_IS_BETTER = ["juda_yomon", "yomon", "ortacha", "yaxshi", "alo"] as const;

export interface WindingResistance {
  ryuqAB: number;
  ryuqBC: number;
  ryuqCA: number;
  rnnA: number;
  rnnB: number;
  rnnC: number;
}

/** f3 — Chulg'am holati: nominal qarshilikdan og'ish (±2% normal, ±5% warning, >5% danger). */
export function assessWinding(actual: WindingResistance, nominal: WindingResistance): FisResult {
  const pctCenters: readonly [number, number, number, number, number] = [0, 0.02, 0.05, 0.08, 0.15];
  const variableSets = {
    ryuqAB: deviationMembershipSet(nominal.ryuqAB, pctCenters),
    ryuqBC: deviationMembershipSet(nominal.ryuqBC, pctCenters),
    ryuqCA: deviationMembershipSet(nominal.ryuqCA, pctCenters),
    rnnA: deviationMembershipSet(nominal.rnnA, pctCenters),
    rnnB: deviationMembershipSet(nominal.rnnB, pctCenters),
    rnnC: deviationMembershipSet(nominal.rnnC, pctCenters),
  };
  return evaluateCanonicalFis({ ...actual }, variableSets);
}

export interface InsulationResistance {
  rizol1: number; // R_izol.Yk-Pk+K, MOhm
  rizol2: number; // R_izol.Pk-Yk+K, MOhm
  rizol3: number; // R_izol.Pk+Yk-K, MOhm
  kAbs1: number;
  kAbs2: number;
  kAbs3: number;
}

/** f4 — Izolyatsiya holati: barcha ko'rsatkichlar uchun katta qiymat yaxshi. */
export function assessInsulation(input: InsulationResistance): FisResult {
  const variableSets = {
    rizol1: directValueMembershipSet([500, 750, 1000, 1250, 1500], HIGHER_IS_BETTER),
    rizol2: directValueMembershipSet([500, 750, 1000, 1250, 1500], HIGHER_IS_BETTER),
    rizol3: directValueMembershipSet([500, 750, 1000, 1250, 1500], HIGHER_IS_BETTER),
    kAbs1: directValueMembershipSet([0.8, 1.0, 1.3, 1.6, 2.0], HIGHER_IS_BETTER),
    kAbs2: directValueMembershipSet([0.8, 1.0, 1.3, 1.6, 2.0], HIGHER_IS_BETTER),
    kAbs3: directValueMembershipSet([0.8, 1.0, 1.3, 1.6, 2.0], HIGHER_IS_BETTER),
  };
  return evaluateCanonicalFis({ ...input }, variableSets);
}

/**
 * f5 — Elektr qism: f3 va f4 ning ANIQ (crisp) natijalarini qayta
 * fuzzifikatsiya qilib, alohida qoida bazasi orqali hisoblaydi (FUZZY.md
 * §5.C, dissertatsiyadagi `W(tr.el.qism)i = min(mu(f3(i)), mu(f4(i)), 1)`
 * formulasiga aynan mos) — f3/f4'ning oddiy o'rtachasi EMAS.
 */
export function assessElectricalPart(windingScore: number, insulationScore: number): FisResult {
  const variableSets = {
    winding: scoreMembershipSet(),
    insulation: scoreMembershipSet(),
  };
  return evaluateCanonicalFis({ winding: windingScore, insulation: insulationScore }, variableSets);
}

export interface TransformerNonElectricalInput {
  transformatorHarorati: number; // T_tr, °C (yog'/o'ram harorati)
  tebranish: number; // mm/s
}

/** f6 — Noelektr qism: kirish 2 ta (harorat, tebranish). */
export function assessTransformerNonElectrical(input: TransformerNonElectricalInput): FisResult {
  const variableSets = {
    transformatorHarorati: directValueMembershipSet([50, 65, 80, 95, 110]),
    // Transformator uchun tebranish chegarasi turbina/generatordan past
    // (FUZZY.md: "<0.5 mm/s normal").
    tebranish: directValueMembershipSet([0.15, 0.5, 1, 2, 3]),
  };
  return evaluateCanonicalFis(
    { transformatorHarorati: input.transformatorHarorati, tebranish: input.tebranish },
    variableSets,
  );
}

export interface TransformerAssessmentResult {
  f3: FisResult;
  f4: FisResult;
  f5: FisResult;
  f6: FisResult;
  fTrScore: number;
}

export function assessTransformer(
  winding: { actual: WindingResistance; nominal: WindingResistance },
  insulation: InsulationResistance,
  nonElectrical: TransformerNonElectricalInput,
): TransformerAssessmentResult {
  const f3 = assessWinding(winding.actual, winding.nominal);
  const f4 = assessInsulation(insulation);
  const f5 = assessElectricalPart(f3.score, f4.score);
  const f6 = assessTransformerNonElectrical(nonElectrical);
  const fTrScore = Math.round(Math.sqrt(f5.score * f6.score) * 100) / 100;

  return { f3, f4, f5, f6, fTrScore };
}
