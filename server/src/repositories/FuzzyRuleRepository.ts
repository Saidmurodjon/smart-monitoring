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
