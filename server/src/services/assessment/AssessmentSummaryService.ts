import { findLatestAssessmentsForAggregate, type LatestAssessmentRow } from "../../repositories/FuzzyAssessmentRepository";

export interface ScoreEntry {
  score: number;
  status: string;
  assessedAt: string;
}

export interface AssessmentSummary {
  turbine: ScoreEntry | null; // Fgt
  generator: ScoreEntry | null; // F_gg
  transformer: ScoreEntry | null; // F_tr
  ges: ScoreEntry | null; // GES darajasi
  details: {
    f1?: ScoreEntry;
    f2?: ScoreEntry;
    f3?: ScoreEntry;
    f4?: ScoreEntry;
    f5?: ScoreEntry;
    f6?: ScoreEntry;
  };
}

function toEntry(row: LatestAssessmentRow): ScoreEntry {
  return { score: row.healthScore, status: row.healthStatus, assessedAt: row.assessedAt.toISOString() };
}

/**
 * Bitta aggregate uchun barcha FIS bloklarining eng so'nggi natijalarini
 * o'qib beradi — HISOBLASH QILMAYDI, faqat DB'da allaqachon saqlangan
 * natijalarni qaytaradi (dashboard/GES sahifalari uchun tez, yon-effektsiz
 * o'qish). Yangi baholash kerak bo'lsa, mos POST /api/v1/assessment/...
 * endpointlari ishlatiladi.
 */
export async function getAssessmentSummary(aggregateId: number): Promise<AssessmentSummary> {
  const rows = await findLatestAssessmentsForAggregate(aggregateId);

  const find = (equipmentType: string, assessmentType: string): ScoreEntry | undefined => {
    const row = rows.find((r) => r.equipmentType === equipmentType && r.assessmentType === assessmentType);
    return row ? toEntry(row) : undefined;
  };

  return {
    turbine: find("TURBINE", "Fgt") ?? null,
    generator: find("GENERATOR", "F_gg") ?? null,
    transformer: find("TRANSFORMER", "F_tr") ?? null,
    ges: find("GES", "GES") ?? null,
    details: {
      f1: find("GENERATOR", "f1"),
      f2: find("GENERATOR", "f2"),
      f3: find("TRANSFORMER", "f3"),
      f4: find("TRANSFORMER", "f4"),
      f5: find("TRANSFORMER", "f5"),
      f6: find("TRANSFORMER", "f6"),
    },
  };
}
