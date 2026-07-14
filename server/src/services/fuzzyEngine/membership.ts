// A'zolik funksiyalari (membership functions) — barchasi triangular/shoulder
// ko'rinishida. .claude/rules/fuzzy-logic.md #1: har bir parametr uchun
// triangular yoki trapezoidal a'zolik funksiyasi aniq belgilanishi kerak.

export type MembershipFn = (x: number) => number;

/** Chapdan boshlanadigan "yelka" (shoulder): edge gacha 1, next'da 0 ga tushadi. */
export function leftShoulder(edge: number, next: number): MembershipFn {
  return (x: number): number => {
    if (x <= edge) return 1;
    if (x >= next) return 0;
    return (next - x) / (next - edge);
  };
}

/** O'ngga qarab ko'tariladigan "yelka": prev'da 0, edge'dan boshlab 1. */
export function rightShoulder(prev: number, edge: number): MembershipFn {
  return (x: number): number => {
    if (x <= prev) return 0;
    if (x >= edge) return 1;
    return (x - prev) / (edge - prev);
  };
}

export function triangular(a: number, b: number, c: number): MembershipFn {
  return (x: number): number => {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x < b) return (x - a) / (b - a);
    return (c - x) / (c - b);
  };
}

/**
 * 5 ta markaz (c1 < c2 < c3 < c4 < c5) asosida "shoulder + triangle + shoulder"
 * standart fuzzy bo'lish (partition) — index 0 = c1'da eng yaxshi, index 4 =
 * c5'da eng yomon (yoki aksincha, chaqiruvchi tomonidan belgilanadi).
 */
export function fiveClassPartition(
  centers: readonly [number, number, number, number, number],
): [MembershipFn, MembershipFn, MembershipFn, MembershipFn, MembershipFn] {
  const [c1, c2, c3, c4, c5] = centers;
  return [
    leftShoulder(c1, c2),
    triangular(c1, c2, c3),
    triangular(c2, c3, c4),
    triangular(c3, c4, c5),
    rightShoulder(c4, c5),
  ];
}
