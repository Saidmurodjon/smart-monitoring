// Barcha FIS bloklari (Fgt, f1, f2, f3, f4, f5, f6, GES) uchun DB'dagi
// qoidalar/o'zgaruvchi ta'riflarini fuzzyEngine/*.ts fayllaridagi hozirgi
// qiymatlar bilan AYNAN bir xil qilib to'ldiradi. `seedFuzzyRulesTurbine.ts`
// ning o'rnini bosadi (shu skript Fgt'ni ham qamrab oladi) — ikkita alohida
// script bir-biridan uzoqlashib ketmasligi uchun.
//
// Ishga tushirish: npx tsx scripts/seedFuzzyRules.ts

import { buildCanonicalRules } from "../src/services/fuzzyEngine/engine";
import { replaceRuleDefinitions, upsertVariableDefinition } from "../src/repositories/FuzzyRuleRepository";
import type { OutputClass } from "../src/services/fuzzyEngine/variableSets";

const HIGHER_IS_BETTER: readonly [OutputClass, OutputClass, OutputClass, OutputClass, OutputClass] = [
  "juda_yomon",
  "yomon",
  "ortacha",
  "yaxshi",
  "alo",
];

interface VariableSeed {
  variable: string;
  kind: "deviation" | "direct" | "score";
  centers: readonly [number, number, number, number, number];
  ascendingOrder?: readonly [OutputClass, OutputClass, OutputClass, OutputClass, OutputClass];
}

interface AssessmentSeed {
  assessmentType: string;
  variables: readonly VariableSeed[];
}

const SEEDS: readonly AssessmentSeed[] = [
  {
    // fuzzyEngine/turbine.ts
    assessmentType: "Fgt",
    variables: [
      { variable: "aylanishTezligi", kind: "deviation", centers: [0, 0.05, 0.1, 0.2, 0.35] },
      { variable: "quvvat", kind: "deviation", centers: [0, 0.1, 0.2, 0.3, 0.5] },
      { variable: "suvSarfi", kind: "deviation", centers: [0, 0.1, 0.2, 0.3, 0.5] },
      { variable: "tebranish", kind: "direct", centers: [0.3, 1, 2, 3.5, 5] },
    ],
  },
  {
    // fuzzyEngine/generator.ts — assessGeneratorElectrical
    assessmentType: "f1",
    variables: [
      { variable: "kAbs", kind: "direct", centers: [0.8, 1.0, 1.3, 1.6, 2.0], ascendingOrder: HIGHER_IS_BETTER },
      { variable: "activePower", kind: "deviation", centers: [0, 0.1, 0.2, 0.3, 0.5] },
      { variable: "reactivePower", kind: "deviation", centers: [0, 0.1, 0.2, 0.3, 0.5] },
    ],
  },
  {
    // fuzzyEngine/generator.ts — assessGeneratorNonElectrical
    assessmentType: "f2",
    variables: [
      { variable: "statorHarorati", kind: "direct", centers: [60, 75, 90, 105, 120] },
      { variable: "tebranish", kind: "direct", centers: [0.3, 1, 2, 3.5, 5] },
    ],
  },
  {
    // fuzzyEngine/transformer.ts — assessWinding
    assessmentType: "f3",
    variables: [
      { variable: "ryuqAB", kind: "deviation", centers: [0, 0.02, 0.05, 0.08, 0.15] },
      { variable: "ryuqBC", kind: "deviation", centers: [0, 0.02, 0.05, 0.08, 0.15] },
      { variable: "ryuqCA", kind: "deviation", centers: [0, 0.02, 0.05, 0.08, 0.15] },
      { variable: "rnnA", kind: "deviation", centers: [0, 0.02, 0.05, 0.08, 0.15] },
      { variable: "rnnB", kind: "deviation", centers: [0, 0.02, 0.05, 0.08, 0.15] },
      { variable: "rnnC", kind: "deviation", centers: [0, 0.02, 0.05, 0.08, 0.15] },
    ],
  },
  {
    // fuzzyEngine/transformer.ts — assessInsulation
    assessmentType: "f4",
    variables: [
      { variable: "rizol1", kind: "direct", centers: [500, 750, 1000, 1250, 1500], ascendingOrder: HIGHER_IS_BETTER },
      { variable: "rizol2", kind: "direct", centers: [500, 750, 1000, 1250, 1500], ascendingOrder: HIGHER_IS_BETTER },
      { variable: "rizol3", kind: "direct", centers: [500, 750, 1000, 1250, 1500], ascendingOrder: HIGHER_IS_BETTER },
      { variable: "kAbs1", kind: "direct", centers: [0.8, 1.0, 1.3, 1.6, 2.0], ascendingOrder: HIGHER_IS_BETTER },
      { variable: "kAbs2", kind: "direct", centers: [0.8, 1.0, 1.3, 1.6, 2.0], ascendingOrder: HIGHER_IS_BETTER },
      { variable: "kAbs3", kind: "direct", centers: [0.8, 1.0, 1.3, 1.6, 2.0], ascendingOrder: HIGHER_IS_BETTER },
    ],
  },
  {
    // fuzzyEngine/transformer.ts — assessElectricalPart (f5 = FIS(f3, f4))
    assessmentType: "f5",
    variables: [
      { variable: "winding", kind: "score", centers: [10, 30, 50, 70, 90] },
      { variable: "insulation", kind: "score", centers: [10, 30, 50, 70, 90] },
    ],
  },
  {
    // fuzzyEngine/transformer.ts — assessTransformerNonElectrical
    assessmentType: "f6",
    variables: [
      { variable: "transformatorHarorati", kind: "direct", centers: [50, 65, 80, 95, 110] },
      { variable: "tebranish", kind: "direct", centers: [0.15, 0.5, 1, 2, 3] },
    ],
  },
  {
    // fuzzyEngine/ges.ts — assessGesLevel
    assessmentType: "GES",
    variables: [
      { variable: "fgt", kind: "score", centers: [10, 30, 50, 70, 90] },
      { variable: "fgg", kind: "score", centers: [10, 30, 50, 70, 90] },
      { variable: "ftr", kind: "score", centers: [10, 30, 50, 70, 90] },
    ],
  },
];

async function main(): Promise<void> {
  for (const seed of SEEDS) {
    for (const variable of seed.variables) {
      await upsertVariableDefinition({
        assessmentType: seed.assessmentType,
        variable: variable.variable,
        kind: variable.kind,
        centers: variable.centers,
        ascendingOrder: variable.ascendingOrder,
      });
    }

    const rules = buildCanonicalRules(
      seed.variables.map((v) => v.variable),
      0.5,
    );
    await replaceRuleDefinitions(seed.assessmentType, rules);

    console.log(
      `"${seed.assessmentType}": ${seed.variables.length} ta o'zgaruvchi, ${rules.length} ta qoida saqlandi.`,
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
