import {
  OUTPUT_CLASSES,
  OUTPUT_CLASS_CENTERS,
  OUTPUT_CLASS_LABELS,
  classifyScore,
  type ClassMembershipSet,
  type OutputClass,
} from "./variableSets";

/**
 * Generic Mamdani FIS baholovchisi — Artikbaev N.A. PhD dissertatsiyasidagi
 * (2024, Chorvoq GES amaliyoti) "kanonik" qoida shakliga mos: har bir chiqish
 * sinfi (juda_yomon..a'lo) uchun BITTA qoida bor, va bu qoida BARCHA kirish
 * parametrlarini o'sha SINFning a'zolik funksiyasi bo'yicha tekshiradi:
 *
 *   W_i = min(mu(x1 in sinf_i), mu(x2 in sinf_i), ..., 1)
 *   mu*_i = max(W_i * vazn_i, 0)
 *   F = sum(markaz_i * mu*_i) / sum(mu*_i)      // og'irlikli o'rtacha (centroid)
 *
 * .claude/rules/fuzzy-logic.md #3: har bir qoida 0.0-1.0 vaznga ega,
 * defuzzifikatsiyadan oldin qo'llaniladi — shu sabab `ruleWeights` mavjud.
 *
 * Bitta chaqiruv < 1ms ichida bajariladi (sof arifmetika), shuning uchun
 * .claude/rules/fuzzy-logic.md #4'dagi 50ms chegarasi bilan hech qanday
 * muammo yo'q — Worker Thread'ga hozircha ehtiyoj yo'q.
 */

export interface FiredRule {
  outputClass: OutputClass;
  label: string;
  strength: number;
}

export interface FisResult {
  score: number;
  status: string;
  firedRules: FiredRule[];
}

export function evaluateCanonicalFis(
  inputs: Readonly<Record<string, number>>,
  variableSets: Readonly<Record<string, ClassMembershipSet>>,
  ruleWeights: Readonly<Partial<Record<OutputClass, number>>> = {},
): FisResult {
  const variables = Object.keys(variableSets);
  if (variables.length === 0) {
    throw new Error("FIS uchun kamida bitta kirish parametri kerak");
  }

  const strengths: Record<OutputClass, number> = {
    juda_yomon: 0,
    yomon: 0,
    ortacha: 0,
    yaxshi: 0,
    alo: 0,
  };

  for (const outputClass of OUTPUT_CLASSES) {
    const memberships = variables.map((variable) => {
      const value = inputs[variable];
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new Error(`Kirish parametri "${variable}" uchun yaroqli son berilmagan`);
      }
      return variableSets[variable][outputClass](value);
    });
    memberships.push(1); // dissertatsiyadagi min(..., 1)
    const weight = ruleWeights[outputClass] ?? 1;
    strengths[outputClass] = Math.max(Math.min(...memberships) * weight, 0);
  }

  const numerator = OUTPUT_CLASSES.reduce((sum, cls) => sum + OUTPUT_CLASS_CENTERS[cls] * strengths[cls], 0);
  const denominator = OUTPUT_CLASSES.reduce((sum, cls) => sum + strengths[cls], 0);

  if (denominator === 0) {
    // Kirish qiymatlari bir vaqtning o'zida bironta sinfga (juda_yomon..a'lo)
    // to'liq mos kelmadi — bu "kanonik" 5 qoidali FIS'ning bilinган
    // cheklovi (masalan bitta parametr a'lo, boshqasi juda yomon bo'lsa,
    // hech qaysi qoida to'liq ishga tushmaydi). Bunday holatda 0 ballga
    // sukut bo'yicha qaytish noto'g'ri (chalg'ituvchi) natija berardi —
    // shuning uchun aniq xato tashlanadi; chaqiruvchi tomon
    // (.claude/rules/fuzzy-logic.md #3: xatolikda oldingi cache qaytarilsin)
    // buni ushlab, oldingi baholashni qaytarishi kerak.
    throw new Error(
      "FIS hisoblanmadi: kirish qiymatlari birorta chiqish sinfiga bir vaqtda mos kelmadi (qoidalar bazasi to'liqroq bo'lishi kerak)",
    );
  }

  const score = numerator / denominator;
  const roundedScore = Math.round(score * 100) / 100;

  return {
    score: roundedScore,
    status: OUTPUT_CLASS_LABELS[classifyScore(roundedScore)],
    firedRules: OUTPUT_CLASSES.map((cls) => ({
      outputClass: cls,
      label: OUTPUT_CLASS_LABELS[cls],
      strength: Math.round(strengths[cls] * 1000) / 1000,
    })),
  };
}
