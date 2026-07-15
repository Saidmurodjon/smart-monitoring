import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import TitleCard from "../../components/Cards/TitleCard";
import Button from "../../components/buttons/Button";
import http from "../../utils/http";

const KIND_OPTIONS = [
  { value: "deviation", label: "Nominaldan og'ish (deviation)" },
  { value: "direct", label: "Xom qiymat (direct)" },
  { value: "score", label: "Boshqa FIS bahosi (score, 0-100)" },
];

// variableSets.ts'dagi ascendingOrder konvensiyasi bilan bir xil.
const HIGHER_IS_BETTER = ["juda_yomon", "yomon", "ortacha", "yaxshi", "alo"];

function FuzzyRuleDetail() {
  const [params] = useSearchParams();
  const assessmentType = params.get("type");

  const [variables, setVariables] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({}); // variable -> { kind, centers, ascendingOrder }
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await http.get(`/fuzzy-rules/${assessmentType}`);
      setVariables(data.variables || []);
      setRules(data.rules || []);
      const nextDrafts = {};
      (data.variables || []).forEach((v) => {
        nextDrafts[v.variable] = {
          kind: v.kind,
          centers: [...v.centers],
          ascendingOrder: v.ascendingOrder ? [...v.ascendingOrder] : null,
        };
      });
      setDrafts(nextDrafts);
    } catch (err) {
      toast.error("Ma'lumot topilmadi", { theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assessmentType) load();
    // eslint-disable-next-line
  }, [assessmentType]);

  const updateCenter = (variable, idx, value) => {
    setDrafts((prev) => {
      const centers = [...prev[variable].centers];
      centers[idx] = value === "" ? "" : Number(value);
      return { ...prev, [variable]: { ...prev[variable], centers } };
    });
  };

  const updateKind = (variable, kind) => {
    setDrafts((prev) => ({ ...prev, [variable]: { ...prev[variable], kind } }));
  };

  const updateHigherIsBetter = (variable, checked) => {
    setDrafts((prev) => ({
      ...prev,
      [variable]: { ...prev[variable], ascendingOrder: checked ? HIGHER_IS_BETTER : null },
    }));
  };

  const save = async (variable) => {
    const draft = drafts[variable];
    const centers = draft.centers.map(Number);
    if (centers.some((c) => Number.isNaN(c))) {
      toast.error("Barcha markazlar son bo'lishi shart", { theme: "colored" });
      return;
    }

    setSaving(variable);
    try {
      const body = { kind: draft.kind, centers };
      if (draft.kind === "direct" && draft.ascendingOrder) body.ascendingOrder = draft.ascendingOrder;
      await http.put(`/fuzzy-rules/${assessmentType}/variables/${variable}`, body);
      toast.success(`"${variable}" saqlandi — o'zgarish darhol kuchga kirdi`, { theme: "colored" });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Saqlashda xatolik yuz berdi", { theme: "colored" });
    } finally {
      setSaving(null);
    }
  };

  if (!assessmentType) {
    return <TitleCard title="Fuzzy blok">Blok tanlanmagan.</TitleCard>;
  }

  return (
    <TitleCard
      title={`Fuzzy blok: ${assessmentType}`}
      topMargin="mt-2"
      TopSideButtons={<Button name="Orqaga" btnStyle="btn-ghost btn-sm normal-case" navigate={-1} />}
    >
      {loading ? (
        <div>Yuklanmoqda...</div>
      ) : (
        <>
          <h3 className="font-semibold mb-2">Oʻzgaruvchilar (aʼzolik funksiyalari)</h3>
          <div className="overflow-x-auto w-full mb-8">
            <table className="table w-full text-sm">
              <thead>
                <tr>
                  <th>O'zgaruvchi</th>
                  <th>Turi</th>
                  <th>Markazlar (5 ta, o'sish tartibida)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {variables.map((v) => {
                  const draft = drafts[v.variable] || { kind: v.kind, centers: v.centers, ascendingOrder: null };
                  return (
                    <tr key={v.variable}>
                      <td className="font-medium align-top pt-3">{v.variable}</td>
                      <td className="align-top">
                        <select
                          className="select select-bordered select-sm"
                          value={draft.kind}
                          onChange={(e) => updateKind(v.variable, e.target.value)}
                        >
                          {KIND_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {draft.kind === "direct" && (
                          <label className="flex items-center gap-1 text-xs mt-1 cursor-pointer">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-xs"
                              checked={Boolean(draft.ascendingOrder)}
                              onChange={(e) => updateHigherIsBetter(v.variable, e.target.checked)}
                            />
                            Katta qiymat yaxshi
                          </label>
                        )}
                      </td>
                      <td className="align-top">
                        <div className="flex gap-1 flex-wrap">
                          {draft.centers.map((c, idx) => (
                            <input
                              key={idx}
                              type="number"
                              step="any"
                              className="input input-bordered input-sm w-20"
                              value={c}
                              onChange={(e) => updateCenter(v.variable, idx, e.target.value)}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="align-top">
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={saving === v.variable}
                          onClick={() => save(v.variable)}
                        >
                          {saving === v.variable ? "..." : "Saqlash"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h3 className="font-semibold mb-2">Qoidalar ({rules.length} ta, faqat ko'rish)</h3>
          <div className="overflow-x-auto w-full max-h-96 overflow-y-auto border border-base-200 rounded-lg">
            <table className="table table-sm w-full text-xs">
              <thead>
                <tr>
                  <th>Shartlar</th>
                  <th>Chiqish sinfi</th>
                  <th>Og'irlik</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r, idx) => (
                  <tr key={idx}>
                    <td className="whitespace-nowrap">
                      {Object.entries(r.antecedents)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(", ")}
                    </td>
                    <td>{r.outputClass}</td>
                    <td>{r.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </TitleCard>
  );
}

export default FuzzyRuleDetail;
