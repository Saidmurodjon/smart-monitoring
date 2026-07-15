import type { Request, Response } from "express";
import type { EquipmentType } from "@prisma/client";
import { upsertStaticParam } from "../../../repositories/EquipmentStaticParamRepository";
import { insertReadings, type ReadingInput } from "../../../repositories/SensorReadingRepository";

const VALID_EQUIPMENT_TYPES: readonly string[] = ["TURBINE", "GENERATOR", "TRANSFORMER"];

function toPositiveInt(raw: unknown): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseEquipmentType(raw: unknown): EquipmentType | null {
  if (typeof raw !== "string") return null;
  const upper = raw.toUpperCase();
  return VALID_EQUIPMENT_TYPES.includes(upper) ? (upper as EquipmentType) : null;
}

interface ParamEntry {
  name: string;
  value: number;
  unit?: string;
}

function parseParamEntries(raw: unknown): ParamEntry[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const entries: ParamEntry[] = [];
  for (const item of raw) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as Record<string, unknown>).name !== "string" ||
      typeof (item as Record<string, unknown>).value !== "number" ||
      Number.isNaN((item as Record<string, unknown>).value)
    ) {
      return null;
    }
    const entry = item as Record<string, unknown>;
    entries.push({
      name: entry.name as string,
      value: entry.value as number,
      unit: typeof entry.unit === "string" ? entry.unit : undefined,
    });
  }
  return entries;
}

/** PUT /api/aggregates/:aggregateId/:equipmentType/static-params */
export async function setStaticParamsHandler(req: Request, res: Response): Promise<void> {
  const aggregateId = toPositiveInt(req.params.aggregateId);
  const equipmentType = parseEquipmentType(req.params.equipmentType);
  if (aggregateId === null || equipmentType === null) {
    res.status(400).json({ message: "Yaroqsiz aggregateId yoki equipmentType" });
    return;
  }

  const params = parseParamEntries((req.body as Record<string, unknown>)?.params);
  if (params === null) {
    res.status(400).json({ message: '"params" massiv bo\'lishi shart: [{ name, value, unit? }, ...]' });
    return;
  }

  try {
    await Promise.all(
      params.map((p) => upsertStaticParam(aggregateId, equipmentType, p.name, p.value, { unit: p.unit })),
    );
    res.status(200).json({ ok: true, count: params.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Saqlashda xatolik yuz berdi";
    res.status(500).json({ message });
  }
}

/** POST /api/aggregates/:aggregateId/:equipmentType/readings */
export async function ingestReadingsHandler(req: Request, res: Response): Promise<void> {
  const aggregateId = toPositiveInt(req.params.aggregateId);
  const equipmentType = parseEquipmentType(req.params.equipmentType);
  if (aggregateId === null || equipmentType === null) {
    res.status(400).json({ message: "Yaroqsiz aggregateId yoki equipmentType" });
    return;
  }

  const readings = parseParamEntries((req.body as Record<string, unknown>)?.readings);
  if (readings === null) {
    res.status(400).json({ message: '"readings" massiv bo\'lishi shart: [{ name, value, unit? }, ...]' });
    return;
  }

  try {
    const inserted: ReadingInput[] = readings.map((r) => ({ paramName: r.name, value: r.value, unit: r.unit }));
    const count = await insertReadings(aggregateId, equipmentType, inserted);
    res.status(201).json({ ok: true, count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Saqlashda xatolik yuz berdi";
    res.status(500).json({ message });
  }
}
