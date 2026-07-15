import type { Request, Response } from "express";
import {
  listAssessmentTypes,
  getVariableDefinitions,
  getRuleDefinitions,
  upsertVariableDefinition,
  deleteVariableDefinition,
  replaceRuleDefinitions,
} from "../../../repositories/FuzzyRuleRepository";
import { invalidateFisDefinitionCache } from "../../../services/fuzzyEngine/dbRuleLoader";
import { OUTPUT_CLASSES, type OutputClass } from "../../../services/fuzzyEngine/variableSets";

// GES DB-asosli qoidalar bazasini boshqarish (CRUD) uchun admin API.
// `.claude/rules/fuzzy-logic.md` #3: har bir qoida 0.0-1.0 vaznga ega —
// bu chegara shu yerda, API chegarasida qat'iy talab qilinadi.

const VALID_KINDS = ["deviation", "direct", "score"] as const;
type VariableKind = (typeof VALID_KINDS)[number];

function isOutputClass(value: unknown): value is OutputClass {
  return typeof value === "string" && (OUTPUT_CLASSES as readonly string[]).includes(value);
}

function isFiveNumberTuple(value: unknown): value is [number, number, number, number, number] {
  if (!Array.isArray(value) || value.length !== 5) return false;
  return value.every((x) => typeof x === "number" && !Number.isNaN(x));
}

function isFiveClassTuple(value: unknown): value is [OutputClass, OutputClass, OutputClass, OutputClass, OutputClass] {
  if (!Array.isArray(value) || value.length !== 5) return false;
  return value.every(isOutputClass);
}

/** GET /api/fuzzy-rules — barcha FIS bloklari (assessmentType) ro'yxati */
export async function listAssessmentTypesHandler(_req: Request, res: Response): Promise<void> {
  const rows = await listAssessmentTypes();
  res.status(200).json(rows);
}

/** GET /api/fuzzy-rules/:assessmentType — bitta blokning to'liq ta'riflari */
export async function getAssessmentTypeHandler(req: Request, res: Response): Promise<void> {
  const assessmentType = req.params.assessmentType as string;
  const [variables, rules] = await Promise.all([
    getVariableDefinitions(assessmentType),
    getRuleDefinitions(assessmentType),
  ]);

  if (variables.length === 0 && rules.length === 0) {
    res.status(404).json({ message: `"${assessmentType}" uchun DB'da ta'rif topilmadi` });
    return;
  }

  res.status(200).json({ assessmentType, variables, rules });
}

/** PUT /api/fuzzy-rules/:assessmentType/variables/:variable — bitta o'zgaruvchi ta'rifini yangilash/yaratish */
export async function upsertVariableHandler(req: Request, res: Response): Promise<void> {
  const assessmentType = req.params.assessmentType as string;
  const variable = req.params.variable as string;
  const body = req.body as Record<string, unknown>;

  if (!VALID_KINDS.includes(body.kind as VariableKind)) {
    res.status(400).json({ message: `"kind" quyidagilardan biri bo'lishi shart: ${VALID_KINDS.join(", ")}` });
    return;
  }
  if (!isFiveNumberTuple(body.centers)) {
    res.status(400).json({ message: '"centers" 5 ta sonli, o\'sish tartibidagi massiv bo\'lishi shart' });
    return;
  }
  const centers = body.centers as [number, number, number, number, number];
  for (let i = 1; i < 5; i += 1) {
    if (centers[i] <= centers[i - 1]) {
      res.status(400).json({ message: '"centers" qat\'iy o\'sish tartibida bo\'lishi shart (masalan [0,0.05,0.1,0.2,0.35])' });
      return;
    }
  }

  let ascendingOrder: [OutputClass, OutputClass, OutputClass, OutputClass, OutputClass] | undefined;
  if (body.ascendingOrder !== undefined) {
    if (!isFiveClassTuple(body.ascendingOrder)) {
      res.status(400).json({
        message: `"ascendingOrder" berilgan bo'lsa, 5 ta yaroqli sinf nomidan iborat bo'lishi shart: ${OUTPUT_CLASSES.join(", ")}`,
      });
      return;
    }
    ascendingOrder = body.ascendingOrder;
  }

  await upsertVariableDefinition({
    assessmentType,
    variable,
    kind: body.kind as VariableKind,
    centers,
    ascendingOrder,
  });
  invalidateFisDefinitionCache(assessmentType);

  res.status(200).json({ ok: true });
}

/** DELETE /api/fuzzy-rules/:assessmentType/variables/:variable */
export async function deleteVariableHandler(req: Request, res: Response): Promise<void> {
  const assessmentType = req.params.assessmentType as string;
  const variable = req.params.variable as string;
  const deleted = await deleteVariableDefinition(assessmentType, variable);
  if (!deleted) {
    res.status(404).json({ message: `"${variable}" ("${assessmentType}") topilmadi` });
    return;
  }
  invalidateFisDefinitionCache(assessmentType);
  res.status(200).json({ ok: true });
}

interface RuleInput {
  antecedents: Record<string, OutputClass>;
  outputClass: OutputClass;
  weight: number;
}

function parseRules(raw: unknown): RuleInput[] | string {
  if (!Array.isArray(raw) || raw.length === 0) {
    return '"rules" bo\'sh bo\'lmagan massiv bo\'lishi shart';
  }

  const rules: RuleInput[] = [];
  for (const [index, item] of raw.entries()) {
    if (typeof item !== "object" || item === null) {
      return `rules[${index}]: obyekt bo'lishi shart`;
    }
    const entry = item as Record<string, unknown>;

    if (!isOutputClass(entry.outputClass)) {
      return `rules[${index}].outputClass yaroqli sinf bo'lishi shart: ${OUTPUT_CLASSES.join(", ")}`;
    }
    if (typeof entry.weight !== "number" || Number.isNaN(entry.weight) || entry.weight < 0 || entry.weight > 1) {
      // .claude/rules/fuzzy-logic.md #3: har bir qoida 0.0-1.0 vaznga ega.
      return `rules[${index}].weight 0.0 dan 1.0 gacha bo'lishi shart`;
    }
    if (typeof entry.antecedents !== "object" || entry.antecedents === null || Array.isArray(entry.antecedents)) {
      return `rules[${index}].antecedents { o'zgaruvchi: sinf } ko'rinishidagi obyekt bo'lishi shart`;
    }
    const antecedents: Record<string, OutputClass> = {};
    for (const [key, value] of Object.entries(entry.antecedents as Record<string, unknown>)) {
      if (!isOutputClass(value)) {
        return `rules[${index}].antecedents.${key} yaroqli sinf bo'lishi shart: ${OUTPUT_CLASSES.join(", ")}`;
      }
      antecedents[key] = value;
    }

    rules.push({ antecedents, outputClass: entry.outputClass, weight: entry.weight });
  }

  return rules;
}

/** PUT /api/fuzzy-rules/:assessmentType/rules — shu blok uchun BARCHA qoidalarni almashtiradi */
export async function replaceRulesHandler(req: Request, res: Response): Promise<void> {
  const assessmentType = req.params.assessmentType as string;
  const parsed = parseRules((req.body as Record<string, unknown>)?.rules);
  if (typeof parsed === "string") {
    res.status(400).json({ message: parsed });
    return;
  }

  await replaceRuleDefinitions(assessmentType, parsed);
  invalidateFisDefinitionCache(assessmentType);

  res.status(200).json({ ok: true, count: parsed.length });
}
