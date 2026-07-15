import { evaluateCanonicalFis, evaluateFis, type FisResult } from "./engine";
import { deviationMembershipSet, directValueMembershipSet } from "./variableSets";
import { loadFisDefinition } from "./dbRuleLoader";

// FUZZY.md §5.A — Gidroturbina (Fgt): 4 ta dinamik kirish, statik parametr
// yo'q.
//
// `assessTurbine()` — .claude/rules/fuzzy-logic.md #2'dagi "faqat asosiy
// (default) 10 ta qoida kodda bo'lishi mumkin" qoidasiga mos, kodda
// qolgan DEFAULT/fallback FIS (DB ishlamay qolsa yoki hali seed
// qilinmagan bo'lsa ishlatiladi).
//
// `assessTurbineFromDb()` — asosiy yo'l: qoidalar va a'zolik funksiyalari
// `fuzzy_variable_definitions`/`fuzzy_rule_definitions` jadvallaridan
// o'qiladi (`TurbineAssessmentService` shu funksiyani birinchi urinadi).

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

export async function assessTurbineFromDb(input: TurbineInput, nominal: TurbineNominal): Promise<FisResult> {
  const { variableSets, rules } = await loadFisDefinition("Fgt", {
    aylanishTezligi: nominal.aylanishTezligiNominal,
    quvvat: nominal.quvvatNominal,
    suvSarfi: nominal.suvSarfiNominal,
  });

  return evaluateFis(
    {
      aylanishTezligi: input.aylanishTezligi,
      quvvat: input.quvvat,
      suvSarfi: input.suvSarfi,
      tebranish: input.tebranish,
    },
    variableSets,
    rules,
  );
}
