import type { Request, Response } from "express";
import { runGesAssessment } from "../../../services/assessment/GesAssessmentService";

function toPositiveInt(raw: unknown): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function assessGesHandler(req: Request, res: Response): Promise<void> {
  const aggregateId = toPositiveInt(req.params.aggregateId);
  if (aggregateId === null) {
    res.status(400).json({ message: "Yaroqsiz aggregateId" });
    return;
  }

  try {
    const result = await runGesAssessment(aggregateId);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Baholashda xatolik yuz berdi";
    res.status(422).json({ message });
  }
}
