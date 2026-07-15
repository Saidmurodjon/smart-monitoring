import type { Request, Response } from "express";
import { getAssessmentSummary } from "../../../services/assessment/AssessmentSummaryService";

function toPositiveInt(raw: unknown): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** GET /api/v1/assessment/:aggregateId/summary */
export async function getAssessmentSummaryHandler(req: Request, res: Response): Promise<void> {
  const aggregateId = toPositiveInt(req.params.aggregateId);
  if (aggregateId === null) {
    res.status(400).json({ message: "Yaroqsiz aggregateId" });
    return;
  }

  const summary = await getAssessmentSummary(aggregateId);
  res.status(200).json(summary);
}
