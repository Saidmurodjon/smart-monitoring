import type { Request, Response } from "express";
import { runGeneratorAssessment } from "../../../services/assessment/GeneratorAssessmentService";

const REQUIRED_NUMERIC_FIELDS = [
  "IA",
  "IB",
  "IC",
  "UA",
  "UB",
  "UC",
  "cosPhi",
  "sinPhi",
  "R60",
  "R15",
  "pNominal",
  "qNominal",
  "statorHarorati",
  "tebranish",
] as const;

function toPositiveInt(raw: unknown): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function assessGeneratorHandler(req: Request, res: Response): Promise<void> {
  const aggregateId = toPositiveInt(req.params.aggregateId);
  if (aggregateId === null) {
    res.status(400).json({ message: "Yaroqsiz aggregateId" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  for (const field of REQUIRED_NUMERIC_FIELDS) {
    if (typeof body[field] !== "number" || Number.isNaN(body[field])) {
      res.status(400).json({ message: `"${field}" son (number) ko'rinishida berilishi shart` });
      return;
    }
  }

  try {
    const result = await runGeneratorAssessment(
      aggregateId,
      {
        IA: body.IA as number,
        IB: body.IB as number,
        IC: body.IC as number,
        UA: body.UA as number,
        UB: body.UB as number,
        UC: body.UC as number,
        cosPhi: body.cosPhi as number,
        sinPhi: body.sinPhi as number,
        R60: body.R60 as number,
        R15: body.R15 as number,
      },
      {
        pNominal: body.pNominal as number,
        qNominal: body.qNominal as number,
      },
      {
        statorHarorati: body.statorHarorati as number,
        tebranish: body.tebranish as number,
      },
    );
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Baholashda xatolik yuz berdi";
    res.status(500).json({ message });
  }
}
