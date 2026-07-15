import { getRuleDefinitions, getVariableDefinitions, type RuleDefinitionRow, type VariableDefinitionRow } from "../../repositories/FuzzyRuleRepository";
import { deviationMembershipSet, directValueMembershipSet, scoreMembershipSet, type ClassMembershipSet, type OutputClass } from "./variableSets";
import type { FisRule } from "./engine";

// .claude/rules/fuzzy-logic.md #2: qoidalar DB'da saqlanadi (qattiq kod
// emas). Ta'riflar (variable/rule definitions) kamdan-kam o'zgaradi, shuning
// uchun qisqa muddatli xotira keshi bilan DB yukini kamaytiramiz — nominal
// qiymatlar (har bir aggregate uchun boshqacha) keshlanmaydi, har chaqiruvda
// yangidan qo'llaniladi.
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { expiresAt: number; variableDefs: VariableDefinitionRow[]; ruleDefs: RuleDefinitionRow[] }>();

async function getDefinitions(
  assessmentType: string,
): Promise<{ variableDefs: VariableDefinitionRow[]; ruleDefs: RuleDefinitionRow[] }> {
  const cached = cache.get(assessmentType);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }
  const [variableDefs, ruleDefs] = await Promise.all([
    getVariableDefinitions(assessmentType),
    getRuleDefinitions(assessmentType),
  ]);
  const entry = { expiresAt: Date.now() + CACHE_TTL_MS, variableDefs, ruleDefs };
  cache.set(assessmentType, entry);
  return entry;
}

export function invalidateFisDefinitionCache(assessmentType?: string): void {
  if (assessmentType) cache.delete(assessmentType);
  else cache.clear();
}

export interface LoadedFis {
  variableSets: Record<string, ClassMembershipSet>;
  rules: FisRule[];
}

/**
 * DB'dagi ta'riflardan (`fuzzy_variable_definitions`, `fuzzy_rule_definitions`)
 * `evaluateFis()` kutgan shakldagi `variableSets`/`rules`ni quradi.
 * `nominalValues` — faqat "deviation" turidagi o'zgaruvchilar uchun kerak
 * (har bir aggregate/jihozga xos, keshlanmaydi).
 */
export async function loadFisDefinition(
  assessmentType: string,
  nominalValues: Readonly<Record<string, number>> = {},
): Promise<LoadedFis> {
  const { variableDefs, ruleDefs } = await getDefinitions(assessmentType);

  if (variableDefs.length === 0) {
    throw new Error(`"${assessmentType}" uchun DB'da o'zgaruvchi ta'riflari topilmadi (fuzzy_variable_definitions)`);
  }
  if (ruleDefs.length === 0) {
    throw new Error(`"${assessmentType}" uchun DB'da qoidalar topilmadi (fuzzy_rule_definitions)`);
  }

  const variableSets: Record<string, ClassMembershipSet> = {};
  for (const def of variableDefs) {
    if (def.kind === "deviation") {
      const nominal = nominalValues[def.variable];
      if (typeof nominal !== "number" || Number.isNaN(nominal)) {
        throw new Error(`"${def.variable}" uchun nominal qiymat berilmagan (kind=deviation)`);
      }
      variableSets[def.variable] = deviationMembershipSet(nominal, def.centers);
    } else if (def.kind === "direct") {
      variableSets[def.variable] = def.ascendingOrder
        ? directValueMembershipSet(def.centers, def.ascendingOrder as [OutputClass, OutputClass, OutputClass, OutputClass, OutputClass])
        : directValueMembershipSet(def.centers);
    } else if (def.kind === "score") {
      variableSets[def.variable] = scoreMembershipSet();
    } else {
      throw new Error(`"${def.variable}" uchun noma'lum o'zgaruvchi turi: "${def.kind}"`);
    }
  }

  const rules: FisRule[] = ruleDefs.map((rule) => ({
    antecedents: rule.antecedents as Record<string, OutputClass>,
    outputClass: rule.outputClass as OutputClass,
    weight: rule.weight,
  }));

  return { variableSets, rules };
}
