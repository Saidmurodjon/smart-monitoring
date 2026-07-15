import type { Request, Response } from "express";
import {
  runTurbineAssessment,
  runTurbineAssessmentFromStoredData,
} from "../../../services/assessment/TurbineAssessmentService";

const REQUIRED_NUMERIC_FIELDS = [
  "aylanishTezligi",
  "quvvat",
  "suvSarfi",
  "tebranish",
  "aylanishTezligiNominal",
  "quvvatNominal",
  "suvSarfiNominal",
] as const;

function toPositiveInt(raw: unknown): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function assessTurbineHandler(req: Request, res: Response): Promise<void> {
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
    const result = await runTurbineAssessment(
      aggregateId,
      {
        aylanishTezligi: body.aylanishTezligi as number,
        quvvat: body.quvvat as number,
        suvSarfi: body.suvSarfi as number,
        tebranish: body.tebranish as number,
      },
      {
        aylanishTezligiNominal: body.aylanishTezligiNominal as number,
        quvvatNominal: body.quvvatNominal as number,
        suvSarfiNominal: body.suvSarfiNominal as number,
      },
    );
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Baholashda xatolik yuz berdi";
    res.status(500).json({ message });
  }
}

export async function assessTurbineFromStoredHandler(req: Request, res: Response): Promise<void> {
  const aggregateId = toPositiveInt(req.params.aggregateId);
  if (aggregateId === null) {
    res.status(400).json({ message: "Yaroqsiz aggregateId" });
    return;
  }

  try {
    const result = await runTurbineAssessmentFromStoredData(aggregateId);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Baholashda xatolik yuz berdi";
    res.status(422).json({ message });
  }
}
