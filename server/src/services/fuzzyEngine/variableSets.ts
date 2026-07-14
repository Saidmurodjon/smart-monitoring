import { fiveClassPartition, type MembershipFn } from "./membership";

export const OUTPUT_CLASSES = ["juda_yomon", "yomon", "ortacha", "yaxshi", "alo"] as const;
export type OutputClass = (typeof OUTPUT_CLASSES)[number];

export const OUTPUT_CLASS_LABELS: Record<OutputClass, string> = {
  juda_yomon: "Juda yomon",
  yomon: "Yomon",
  ortacha: "O'rtacha",
  yaxshi: "Yaxshi",
  alo: "A'lo",
};

// FUZZY.md §4 — ball chegaralari (2-rasm algoritmi): ≤20/40/60/80.
// Har bir holatning defuzzifikatsiya uchun ishlatiladigan vakillik qiymati —
// oraliqning o'rtasi.
export const OUTPUT_CLASS_CENTERS: Record<OutputClass, number> = {
  juda_yomon: 10,
  yomon: 30,
  ortacha: 50,
  yaxshi: 70,
  alo: 90,
};

export function classifyScore(score: number): OutputClass {
  if (score <= 20) return "juda_yomon";
  if (score <= 40) return "yomon";
  if (score <= 60) return "ortacha";
  if (score <= 80) return "yaxshi";
  return "alo";
}

export type ClassMembershipSet = Record<OutputClass, MembershipFn>;

/**
 * "Nominaldan og'ish" turidagi kirish parametrlari uchun (masalan Aylanish
 * tezligi, Quvvat, Suv sarfi): og'ish foizi qancha kichik bo'lsa, shuncha
 * yaxshi. `pctCenters` — [alo, yaxshi, ortacha, yomon, juda_yomon] tartibida
 * og'ish foizi markazlari (masalan [0, 0.05, 0.10, 0.20, 0.35]).
 */
export function deviationMembershipSet(
  nominal: number,
  pctCenters: readonly [number, number, number, number, number],
): ClassMembershipSet {
  const [alo, yaxshi, ortacha, yomon, judaYomon] = fiveClassPartition(pctCenters);
  const deviation = (fn: MembershipFn): MembershipFn => (x: number) => fn(Math.abs(x - nominal) / nominal);
  return {
    alo: deviation(alo),
    yaxshi: deviation(yaxshi),
    ortacha: deviation(ortacha),
    yomon: deviation(yomon),
    juda_yomon: deviation(judaYomon),
  };
}

/**
 * To'g'ridan-to'g'ri qiymat asosidagi parametrlar uchun. `valueCenters` —
 * o'sish tartibida (ascending) 5 ta markaz. `ascendingOrder` — qiymat
 * o'sganda sinflar qanday o'zgarishini bildiradi:
 *   - Tebranish kabi "kichik yaxshi" parametrlar uchun: [alo,yaxshi,ortacha,yomon,juda_yomon] (sukut)
 *   - K_abs kabi "katta yaxshi" parametrlar uchun: [juda_yomon,yomon,ortacha,yaxshi,alo]
 */
export function directValueMembershipSet(
  valueCenters: readonly [number, number, number, number, number],
  ascendingOrder: readonly [OutputClass, OutputClass, OutputClass, OutputClass, OutputClass] = [
    "alo",
    "yaxshi",
    "ortacha",
    "yomon",
    "juda_yomon",
  ],
): ClassMembershipSet {
  const fns = fiveClassPartition(valueCenters);
  const set = {} as ClassMembershipSet;
  ascendingOrder.forEach((cls, i) => {
    set[cls] = fns[i];
  });
  return set;
}
