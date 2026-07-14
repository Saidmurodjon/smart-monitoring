import { evaluateCanonicalFis, type FisResult } from "./engine";
import { deviationMembershipSet, directValueMembershipSet } from "./variableSets";

// FUZZY.md §5.A — Gidroturbina (Fgt): 4 ta dinamik kirish, statik parametr
// yo'q. Chegaralar hozircha test/default qiymatlar — .claude/rules/
// fuzzy-logic.md #2ga ko'ra, keyinchalik DB'ga ko'chiriladi.

export interface TurbineInput {
  aylanishTezligi: number; // RPM
  quvvat: number; // MW
  suvSarfi: number; // m3/s
  tebranish: number; // mm/s
}

export interface TurbineNominal {
  aylanishTezligiNominal: number; // RPM
  quvvatNominal: number; // MW
  suvSarfiNominal: number; // m3/s
}

export function assessTurbine(input: TurbineInput, nominal: TurbineNominal): FisResult {
  const variableSets = {
    aylanishTezligi: deviationMembershipSet(nominal.aylanishTezligiNominal, [0, 0.05, 0.1, 0.2, 0.35]),
    quvvat: deviationMembershipSet(nominal.quvvatNominal, [0, 0.1, 0.2, 0.3, 0.5]),
    suvSarfi: deviationMembershipSet(nominal.suvSarfiNominal, [0, 0.1, 0.2, 0.3, 0.5]),
    tebranish: directValueMembershipSet([0.3, 1, 2, 3.5, 5]),
  };

  return evaluateCanonicalFis(
    {
      aylanishTezligi: input.aylanishTezligi,
      quvvat: input.quvvat,
      suvSarfi: input.suvSarfi,
      tebranish: input.tebranish,
    },
    variableSets,
  );
}
