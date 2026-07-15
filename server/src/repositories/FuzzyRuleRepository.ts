import prisma from "../config/prisma";
import type { FuzzyVariableDefinition, FuzzyRuleDefinition } from "@prisma/client";

export interface VariableDefinitionRow {
  variable: string;
  kind: "deviation" | "direct" | "score";
  centers: [number, number, number, number, number];
  ascendingOrder: string[] | null;
}

export interface RuleDefinitionRow {
  antecedents: Record<string, string>;
  outputClass: string;
  weight: number;
}

export interface AssessmentTypeSummary {
  assessmentType: string;
  variableCount: number;
  ruleCount: number;
}

/** DB'da ta'rif mavjud bo'lgan barcha FIS bloklarini (assessmentType) ro'yxatlaydi. */
export async function listAssessmentTypes(): Promise<AssessmentTypeSummary[]> {
  const [variableGroups, ruleGroups] = await Promise.all([
    prisma.fuzzyVariableDefinition.groupBy({ by: ["assessmentType"], _count: { _all: true } }),
    prisma.fuzzyRuleDefinition.groupBy({ by: ["assessmentType"], _count: { _all: true } }),
  ]);

  type GroupRow = { assessmentType: string; _count: { _all: number } };
  const ruleCounts = new Map((ruleGroups as GroupRow[]).map((g) => [g.assessmentType, g._count._all]));
  return (variableGroups as GroupRow[])
    .map((g) => ({
      assessmentType: g.assessmentType,
      variableCount: g._count._all,
      ruleCount: ruleCounts.get(g.assessmentType) ?? 0,
    }))
    .sort((a: AssessmentTypeSummary, b: AssessmentTypeSummary) => a.assessmentType.localeCompare(b.assessmentType));
}

export async function getVariableDefinitions(assessmentType: string): Promise<VariableDefinitionRow[]> {
  const rows = await prisma.fuzzyVariableDefinition.findMany({ where: { assessmentType } });
  return rows.map((row: FuzzyVariableDefinition) => ({
    variable: row.variable,
    kind: row.kind as VariableDefinitionRow["kind"],
    centers: row.centers as [number, number, number, number, number],
    ascendingOrder: (row.ascendingOrder as string[] | null) ?? null,
  }));
}

export async function getRuleDefinitions(assessmentType: string): Promise<RuleDefinitionRow[]> {
  const rows = await prisma.fuzzyRuleDefinition.findMany({ where: { assessmentType } });
  return rows.map((row: FuzzyRuleDefinition) => ({
    antecedents: row.antecedents as Record<string, string>,
    outputClass: row.outputClass,
    weight: row.weight,
  }));
}

export async function upsertVariableDefinition(def: {
  assessmentType: string;
  variable: string;
  kind: "deviation" | "direct" | "score";
  centers: readonly [number, number, number, number, number];
  ascendingOrder?: readonly string[];
}): Promise<void> {
  await prisma.fuzzyVariableDefinition.upsert({
    where: { assessmentType_variable: { assessmentType: def.assessmentType, variable: def.variable } },
    create: {
      assessmentType: def.assessmentType,
      variable: def.variable,
      kind: def.kind,
      centers: [...def.centers],
      ascendingOrder: def.ascendingOrder ? [...def.ascendingOrder] : undefined,
    },
    update: {
      kind: def.kind,
      centers: [...def.centers],
      ascendingOrder: def.ascendingOrder ? [...def.ascendingOrder] : undefined,
    },
  });
}

export async function deleteVariableDefinition(assessmentType: string, variable: string): Promise<boolean> {
  const result = await prisma.fuzzyVariableDefinition.deleteMany({ where: { assessmentType, variable } });
  return result.count > 0;
}

/** Berilgan assessmentType uchun eski qoidalarni o'chirib, yangilarini yozadi. */
export async function replaceRuleDefinitions(
  assessmentType: string,
  rules: ReadonlyArray<{ antecedents: Readonly<Record<string, string>>; outputClass: string; weight: number }>,
): Promise<void> {
  await prisma.$transaction([
    prisma.fuzzyRuleDefinition.deleteMany({ where: { assessmentType } }),
    prisma.fuzzyRuleDefinition.createMany({
      data: rules.map((rule) => ({
        assessmentType,
        antecedents: { ...rule.antecedents },
        outputClass: rule.outputClass,
        weight: rule.weight,
      })),
    }),
  ]);
}
