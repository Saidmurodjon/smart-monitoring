import type { Request, Response } from "express";
import {
  runTransformerAssessment,
  runTransformerAssessmentFromStoredData,
} from "../../../services/assessment/TransformerAssessmentService";

const WINDING_FIELDS = ["ryuqAB", "ryuqBC", "ryuqCA", "rnnA", "rnnB", "rnnC"] as const;
const WINDING_NOMINAL_FIELDS = [
  "ryuqABNominal",
  "ryuqBCNominal",
  "ryuqCANominal",
  "rnnANominal",
  "rnnBNominal",
  "rnnCNominal",
] as const;
const INSULATION_FIELDS = ["rizol1", "rizol2", "rizol3", "kAbs1", "kAbs2", "kAbs3"] as const;
const NON_ELECTRICAL_FIELDS = ["transformatorHarorati", "tebranish"] as const;

const ALL_REQUIRED_FIELDS = [
  ...WINDING_FIELDS,
  ...WINDING_NOMINAL_FIELDS,
  ...INSULATION_FIELDS,
  ...NON_ELECTRICAL_FIELDS,
] as const;

function toPositiveInt(raw: unknown): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function assessTransformerHandler(req: Request, res: Response): Promise<void> {
  const aggregateId = toPositiveInt(req.params.aggregateId);
  if (aggregateId === null) {
    res.status(400).json({ message: "Yaroqsiz aggregateId" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  for (const field of ALL_REQUIRED_FIELDS) {
    if (typeof body[field] !== "number" || Number.isNaN(body[field])) {
      res.status(400).json({ message: `"${field}" son (number) ko'rinishida berilishi shart` });
      return;
    }
  }
  const numeric = body as Record<(typeof ALL_REQUIRED_FIELDS)[number], number>;

  try {
    const result = await runTransformerAssessment(
      aggregateId,
      {
        ryuqAB: numeric.ryuqAB,
        ryuqBC: numeric.ryuqBC,
        ryuqCA: numeric.ryuqCA,
        rnnA: numeric.rnnA,
        rnnB: numeric.rnnB,
        rnnC: numeric.rnnC,
      },
      {
        ryuqAB: numeric.ryuqABNominal,
        ryuqBC: numeric.ryuqBCNominal,
        ryuqCA: numeric.ryuqCANominal,
        rnnA: numeric.rnnANominal,
        rnnB: numeric.rnnBNominal,
        rnnC: numeric.rnnCNominal,
      },
      {
        rizol1: numeric.rizol1,
        rizol2: numeric.rizol2,
        rizol3: numeric.rizol3,
        kAbs1: numeric.kAbs1,
        kAbs2: numeric.kAbs2,
        kAbs3: numeric.kAbs3,
      },
      {
        transformatorHarorati: numeric.transformatorHarorati,
        tebranish: numeric.tebranish,
      },
    );
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Baholashda xatolik yuz berdi";
    res.status(500).json({ message });
  }
}

export async function assessTransformerFromStoredHandler(req: Request, res: Response): Promise<void> {
  const aggregateId = toPositiveInt(req.params.aggregateId);
  if (aggregateId === null) {
    res.status(400).json({ message: "Yaroqsiz aggregateId" });
    return;
  }

  try {
    const result = await runTransformerAssessmentFromStoredData(aggregateId);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Baholashda xatolik yuz berdi";
    res.status(422).json({ message });
  }
}
