import {
  OUTPUT_CLASSES,
  OUTPUT_CLASS_CENTERS,
  OUTPUT_CLASS_LABELS,
  classifyScore,
  type ClassMembershipSet,
  type OutputClass,
} from "./variableSets";

/**
 * Generic Mamdani FIS baholovchisi.
 *
 * Har bir qoida: `min(a'zolik darajalari, 1) * vazn` orqali "ishga tushish
 * kuchi" (firing strength) hisoblanadi (Artikbaev N.A. PhD dissertatsiyasi,
 * 2024, Chorvoq GES amaliyoti — `.claude/rules/fuzzy-logic.md` #3: har bir
 * qoida 0.0-1.0 vaznga ega). Bir xil chiqish sinfiga ega bir nechta qoida
 * ishga tushsa, ular orasidan ENG KUCHLISI olinadi — standart Mamdani
 * "qoidalar orasida OR = max" agregatsiyasi. So'ngra og'irlikli o'rtacha
 * (centroid) orqali 0-100 ballga aylantiriladi.
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

/**
 * Bitta FIS qoidasi. `antecedents` — tekshiriladigan o'zgaruvchilar
 * to'plami (o'zgaruvchi nomi -> talab qilingan sinf). Ro'yxatda
 * bo'lmagan o'zgaruvchilar bu qoida uchun "muhim emas" — ular tekshirilmaydi.
 */
export interface FisRule {
  antecedents: Readonly<Record<string, OutputClass>>;
  outputClass: OutputClass;
  weight: number;
}

function ruleFiringStrength(
  rule: FisRule,
  inputs: Readonly<Record<string, number>>,
  variableSets: Readonly<Record<string, ClassMembershipSet>>,
): number {
  const memberships: number[] = [1]; // dissertatsiyadagi min(..., 1)
  for (const variable of Object.keys(rule.antecedents)) {
    const value = inputs[variable];
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error(`Kirish parametri "${variable}" uchun yaroqli son berilmagan`);
    }
    memberships.push(variableSets[variable][rule.antecedents[variable]](value));
  }
  return Math.max(Math.min(...memberships) * rule.weight, 0);
}

/**
 * Istalgan qoidalar ro'yxati bilan ishlaydigan asosiy baholovchi —
 * kelajakda DB'dan yuklanadigan haqiqiy qoidalar (`.claude/rules/
 * fuzzy-logic.md` #2) ham to'g'ridan-to'g'ri shu funksiyaga beriladi.
 */
export function evaluateFis(
  inputs: Readonly<Record<string, number>>,
  variableSets: Readonly<Record<string, ClassMembershipSet>>,
  rules: readonly FisRule[],
): FisResult {
  if (rules.length === 0) {
    throw new Error("FIS uchun kamida bitta qoida kerak");
  }

  const strengths: Record<OutputClass, number> = {
    juda_yomon: 0,
    yomon: 0,
    ortacha: 0,
    yaxshi: 0,
    alo: 0,
  };

  for (const rule of rules) {
    const strength = ruleFiringStrength(rule, inputs, variableSets);
    if (strength > strengths[rule.outputClass]) {
      strengths[rule.outputClass] = strength;
    }
  }

  const numerator = OUTPUT_CLASSES.reduce((sum, cls) => sum + OUTPUT_CLASS_CENTERS[cls] * strengths[cls], 0);
  const denominator = OUTPUT_CLASSES.reduce((sum, cls) => sum + strengths[cls], 0);

  if (denominator === 0) {
    // `buildCanonicalRules()`dagi fallback qoidalar butun kirish domenini
    // qoplagani uchun bu amalda deyarli hech qachon yuz bermaydi — faqat
    // qo'lda tuzilgan, domenni to'liq qoplamaydigan qoidalar bazasi
    // berilganda yuzaga kelishi mumkin bo'lgan himoya (assertion).
    throw new Error("FIS hisoblanmadi: hech qaysi qoida ishga tushmadi (qoidalar bazasi domenni to'liq qoplamaydi)");
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

const DEFAULT_FALLBACK_WEIGHT = 0.5;

/**
 * "Kanonik" qoidalar bazasini avtomatik quradi — ikki qatlam:
 *
 *  1. Har bir chiqish sinfi uchun BITTA "AND" qoida (vazn 1.0) — BARCHA
 *     o'zgaruvchilar o'sha sinfga bir vaqtda mos kelishi kerak. Bu
 *     dissertatsiyaning asl formulasi — barcha parametrlar rozi
 *     bo'lganda ishlaydi.
 *
 *  2. Har bir o'zgaruvchi × har bir sinf uchun "aralash-holat" fallback
 *     qoidasi (bitta o'zgaruvchiga bog'liq, vazn `fallbackWeight`,
 *     sukut 0.5) — kirishlar turli sinflarga tarqalganda ham (masalan
 *     bitta parametr yomon, qolganlari yaxshi) FIS baho bera olishi
 *     uchun. Qoidalar orasida MAX agregatsiyasi ishlatilgani sababli,
 *     bitta yomon o'zgaruvchi o'z ovozini yo'qotmaydi — ko'p sonli yaxshi
 *     o'zgaruvchilar orasida "o'rtachalashib" yuvilib ketmaydi (xavfsizlik
 *     nuqtai nazaridan muhim: bitta halokatli parametr butun baholashni
 *     "A'lo"ga tortib keta olmaydi).
 *
 * AND-qoida to'liq mos kelganda (vazn 1.0) fallback qoidalardan (vazn
 * 0.5) har doim ustun turadi — shuning uchun barcha kirishlar rozi
 * bo'lgan "toza" holatlarda natija aynan dissertatsiya formulasiga mos
 * qoladi, o'zgarmaydi.
 */
export function buildCanonicalRules(
  variables: readonly string[],
  fallbackWeight: number = DEFAULT_FALLBACK_WEIGHT,
): FisRule[] {
  const rules: FisRule[] = [];

  for (const outputClass of OUTPUT_CLASSES) {
    const antecedents: Record<string, OutputClass> = {};
    for (const variable of variables) antecedents[variable] = outputClass;
    rules.push({ antecedents, outputClass, weight: 1 });
  }

  for (const variable of variables) {
    for (const outputClass of OUTPUT_CLASSES) {
      rules.push({ antecedents: { [variable]: outputClass }, outputClass, weight: fallbackWeight });
    }
  }

  return rules;
}

export function evaluateCanonicalFis(
  inputs: Readonly<Record<string, number>>,
  variableSets: Readonly<Record<string, ClassMembershipSet>>,
  fallbackWeight: number = DEFAULT_FALLBACK_WEIGHT,
): FisResult {
  const variables = Object.keys(variableSets);
  if (variables.length === 0) {
    throw new Error("FIS uchun kamida bitta kirish parametri kerak");
  }
  return evaluateFis(inputs, variableSets, buildCanonicalRules(variables, fallbackWeight));
}
