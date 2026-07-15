// Gidroturbina (Fgt) uchun DB'dagi qoidalar/o'zgaruvchi ta'riflarini
// `turbine.ts`dagi hozirgi hardcoded qiymatlar bilan AYNAN bir xil qilib
// to'ldiradi — `buildCanonicalRules()`ning o'zini chaqirib, qo'lda
// transkripsiya xatosi ehtimolini yo'qqa chiqaradi.
//
// Ishga tushirish: npx tsx scripts/seedFuzzyRulesTurbine.ts

import { buildCanonicalRules } from "../src/services/fuzzyEngine/engine";
import { replaceRuleDefinitions, upsertVariableDefinition } from "../src/repositories/FuzzyRuleRepository";

const ASSESSMENT_TYPE = "Fgt";
const VARIABLES = ["aylanishTezligi", "quvvat", "suvSarfi", "tebranish"] as const;

async function main(): Promise<void> {
  await upsertVariableDefinition({
    assessmentType: ASSESSMENT_TYPE,
    variable: "aylanishTezligi",
    kind: "deviation",
    centers: [0, 0.05, 0.1, 0.2, 0.35],
  });
  await upsertVariableDefinition({
    assessmentType: ASSESSMENT_TYPE,
    variable: "quvvat",
    kind: "deviation",
    centers: [0, 0.1, 0.2, 0.3, 0.5],
  });
  await upsertVariableDefinition({
    assessmentType: ASSESSMENT_TYPE,
    variable: "suvSarfi",
    kind: "deviation",
    centers: [0, 0.1, 0.2, 0.3, 0.5],
  });
  await upsertVariableDefinition({
    assessmentType: ASSESSMENT_TYPE,
    variable: "tebranish",
    kind: "direct",
    centers: [0.3, 1, 2, 3.5, 5],
  });

  const rules = buildCanonicalRules(VARIABLES, 0.5);
  await replaceRuleDefinitions(ASSESSMENT_TYPE, rules);

  console.log(`"${ASSESSMENT_TYPE}" uchun ${rules.length} ta qoida va ${VARIABLES.length} ta o'zgaruvchi ta'rifi saqlandi.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
