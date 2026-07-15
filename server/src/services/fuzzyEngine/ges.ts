import { evaluateCanonicalFis, evaluateFis, type FisResult } from "./engine";
import { scoreMembershipSet } from "./variableSets";
import { loadFisDefinition } from "./dbRuleLoader";

/**
 * FUZZY.md §1 "Qatlam 3" / §5.D — GES darajasi. Bu ham to'liq Mamdani FIS
 * (3-rasm Simulink modeliga ko'ra), Fgt/Fgg/Ftr'ning oddiy o'rtachasi EMAS.
 * Har uchala kirish ham 0-100 ball domenida bo'lgani uchun bir xil
 * `scoreMembershipSet()` ishlatiladi.
 */
export function assessGesLevel(fgtScore: number, fggScore: number, ftrScore: number): FisResult {
  const variableSets = {
    fgt: scoreMembershipSet(),
    fgg: scoreMembershipSet(),
    ftr: scoreMembershipSet(),
  };
  return evaluateCanonicalFis({ fgt: fgtScore, fgg: fggScore, ftr: ftrScore }, variableSets);
}

/** DB'dagi qoidalar/ta'riflardan foydalanuvchi GES-darajasidagi baholovchi. */
export async function assessGesLevelFromDb(
  fgtScore: number,
  fggScore: number,
  ftrScore: number,
): Promise<FisResult> {
  const { variableSets, rules } = await loadFisDefinition("GES");
  return evaluateFis({ fgt: fgtScore, fgg: fggScore, ftr: ftrScore }, variableSets, rules);
}
