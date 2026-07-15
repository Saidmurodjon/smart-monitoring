import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import InputText from "../../components/Input/InputText";
import Button from "../../components/buttons/Button";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import http from "../../utils/http";
import { useDispatch } from "react-redux";
import { addGes, updateGes } from "./gesSlice";
import { AGGREGATES_INITIAL_STATE } from "../../utils/initialStates";

const EQUIPMENT_TABS = [
  { key: "turbine", label: "Gidroturbina", equipmentType: "TURBINE", blobKey: "hydroTurbine" },
  { key: "generator", label: "Gidrogenerator", equipmentType: "GENERATOR", blobKey: "hydroGenerator" },
  { key: "transformer", label: "Transformator", equipmentType: "TRANSFORMER", blobKey: "transformer" },
];

// Tavsifiy (inventar) maydonlar — Aggregate.hydroTurbine/hydroGenerator/transformer JSON blobiga saqlanadi.
const DESCRIPTIVE_FIELDS = {
  turbine: [
    { name: "model", label: "Model", type: "text" },
    { name: "power", label: "Rated Power (kW)", type: "number" },
  ],
  generator: [
    { name: "model", label: "Model", type: "text" },
    { name: "power", label: "Rated Power (kW)", type: "number" },
    { name: "voltage_V", label: "Voltage (V)", type: "number" },
    { name: "frequency_Hz", label: "Frequency (Hz)", type: "number" },
    { name: "cosphi", label: "cos φ", type: "number" },
    { name: "efficiency", label: "Efficiency (%)", type: "number" },
    { name: "serialNumber", label: "Serial Number", type: "text" },
  ],
  transformer: [
    { name: "power", label: "Rated Power (kVA)", type: "number" },
    { name: "primary_kV", label: "Primary (kV)", type: "number" },
    { name: "secondary_kV", label: "Secondary (kV)", type: "number" },
    { name: "efficiency", label: "Efficiency (%)", type: "number" },
    { name: "cooling", label: "Cooling", type: "text" },
    { name: "serialNumber", label: "Serial Number", type: "text" },
  ],
};

// FIS nominal statik parametrlar — equipment_static_params jadvaliga saqlanadi
// (FUZZY.md §5 — Fgt/f1/f2/f3/f4 kirishlari). Dinamik qiymatlar (tebranish,
// harorat) bu yerga kirmaydi — ular sensordan avtomatik keladi.
const STATIC_PARAM_GROUPS = {
  TURBINE: [
    {
      title: "Nominal parametrlar (FIS uchun)",
      fields: [
        { key: "aylanishTezligi", label: "Aylanish tezligi", unit: "ayl/daq" },
        { key: "quvvat", label: "Quvvat", unit: "MVt" },
        { key: "suvSarfi", label: "Suv sarfi", unit: "m³/s" },
      ],
    },
  ],
  GENERATOR: [
    {
      title: "Nominal parametrlar (FIS uchun)",
      fields: [
        { key: "R60", label: "R60 (izolyatsiya qarshiligi, 60s)", unit: "MΩ" },
        { key: "R15", label: "R15 (izolyatsiya qarshiligi, 15s)", unit: "MΩ" },
        { key: "pNominal", label: "Nominal faol quvvat (P)", unit: "MVt" },
        { key: "qNominal", label: "Nominal reaktiv quvvat (Q)", unit: "MVAr" },
      ],
    },
  ],
  TRANSFORMER: [
    {
      title: "Chulg'am — nominal qarshiliklar",
      fields: [
        { key: "ryuqAB", label: "R yuq. A-B", unit: "Ω" },
        { key: "ryuqBC", label: "R yuq. B-C", unit: "Ω" },
        { key: "ryuqCA", label: "R yuq. C-A", unit: "Ω" },
        { key: "rnnA", label: "R n.n. A", unit: "Ω" },
        { key: "rnnB", label: "R n.n. B", unit: "Ω" },
        { key: "rnnC", label: "R n.n. C", unit: "Ω" },
      ],
    },
    {
      title: "Chulg'am — joriy (oxirgi o'lchov) qarshiliklar",
      fields: [
        { key: "ryuqABActual", label: "R yuq. A-B (joriy)", unit: "Ω" },
        { key: "ryuqBCActual", label: "R yuq. B-C (joriy)", unit: "Ω" },
        { key: "ryuqCAActual", label: "R yuq. C-A (joriy)", unit: "Ω" },
        { key: "rnnAActual", label: "R n.n. A (joriy)", unit: "Ω" },
        { key: "rnnBActual", label: "R n.n. B (joriy)", unit: "Ω" },
        { key: "rnnCActual", label: "R n.n. C (joriy)", unit: "Ω" },
      ],
    },
    {
      title: "Izolyatsiya",
      fields: [
        { key: "rizol1", label: "R izolyatsiya 1", unit: "MΩ" },
        { key: "rizol2", label: "R izolyatsiya 2", unit: "MΩ" },
        { key: "rizol3", label: "R izolyatsiya 3", unit: "MΩ" },
        { key: "kAbs1", label: "K abs. 1", unit: "" },
        { key: "kAbs2", label: "K abs. 2", unit: "" },
        { key: "kAbs3", label: "K abs. 3", unit: "" },
      ],
    },
  ],
};

function emptyStaticVals() {
  const out = {};
  for (const type of Object.keys(STATIC_PARAM_GROUPS)) {
    out[type] = {};
    for (const group of STATIC_PARAM_GROUPS[type]) {
      for (const f of group.fields) out[type][f.key] = "";
    }
  }
  return out;
}

function AggregatesStaticForm() {
  // edit holati: location.state ichida doc (yoki agregatlar) bo‘lishi mumkin
  const location = useLocation();
  const editingDoc = location?.state || null;
  const isEdit = Boolean(editingDoc?._id);

  const [val, setVal] = useState(editingDoc ? editingDoc : AGGREGATES_INITIAL_STATE);
  const [staticVals, setStaticVals] = useState(emptyStaticVals);
  const [activeTab, setActiveTab] = useState("turbine");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [params] = useSearchParams();
  const gesId = params.get("gesId");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // (ixtiyoriy) editingDoc kelishi kechiksa, state-ni sinxronlab turish
  useEffect(() => {
    if (editingDoc?.aggregates) {
      setVal(editingDoc);
    }
  }, [editingDoc]);

  // Tahrirlash holatida FIS statik nominal parametrlarni DB'dan yuklab olamiz.
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await http.get(`/aggregates/${editingDoc._id}/detail`);
        if (cancelled) return;
        setStaticVals(() => {
          const next = emptyStaticVals();
          for (const type of Object.keys(next)) {
            for (const key of Object.keys(next[type])) {
              const v = data?.staticParams?.[type]?.[key];
              next[type][key] = v === undefined || v === null ? "" : String(v);
            }
          }
          return next;
        });
      } catch (err) {
        toast.error("Texnik parametrlarni yuklashda xatolik yuz berdi", { theme: "colored" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [isEdit, editingDoc?._id]);

  const updateFormValuePath = (e) => {
    const { name, value, type } = e.target;
    const path = name.split(".");
    setVal((prev) => {
      const next = { ...prev };
      let obj = next;
      for (let i = 0; i < path.length - 1; i++) {
        obj[path[i]] = { ...(obj[path[i]] || {}) };
        obj = obj[path[i]];
      }
      const last = path[path.length - 1];
      obj[last] = type === "number" && value !== "" ? Number(value) : value;
      return next;
    });
  };

  const updateStaticValue = (equipmentType, key, value) => {
    setStaticVals((prev) => ({
      ...prev,
      [equipmentType]: { ...prev[equipmentType], [key]: value },
    }));
  };

  const Submit = async () => {
    setSaving(true);
    try {
      const path = isEdit
        ? `ges/${gesId}/aggregates?_id=${editingDoc._id}`
        : `ges/${gesId}/aggregates`;
      const method = isEdit ? "put" : "post";

      const { data: doc } = await http.request({ url: path, method, data: val });
      const aggregateId = doc?._id || doc?.id;

      await Promise.all(
        EQUIPMENT_TABS.map(async ({ equipmentType }) => {
          const entries = Object.entries(staticVals[equipmentType] || {})
            .filter(([, v]) => v !== "" && v !== null && v !== undefined && !Number.isNaN(Number(v)))
            .map(([name, v]) => ({ name, value: Number(v) }));
          if (entries.length === 0) return;
          await http.put(`/aggregates/${aggregateId}/${equipmentType}/static-params`, { params: entries });
        }),
      );

      if (isEdit) dispatch(updateGes(doc));
      else dispatch(addGes(doc));

      toast.success(
        isEdit ? "Agregat ma'lumotlari yangilandi!" : "Agregat ma'lumotlari saqlandi!",
        { theme: "colored" },
      );
      navigate(-1);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err.message;
      toast.error(String(msg), { theme: "colored" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <TitleCard
      title={isEdit ? "Agregatni tahrirlash" : "Yangi agregat qo'shish"}
      topMargin="mt-2"
      TopSideButtons={<Button name="Bekor qilish" btnStyle="btn-ghost btn-sm normal-case" navigate={-1} />}
    >
      {loading ? (
        <div className="py-10 text-center text-gray-500 italic">Yuklanmoqda...</div>
      ) : (
        <>
          <div role="tablist" className="tabs tabs-boxed mb-6 w-fit">
            {EQUIPMENT_TABS.map((tab) => (
              <a
                key={tab.key}
                role="tab"
                className={`tab ${activeTab === tab.key ? "tab-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </a>
            ))}
          </div>

          {EQUIPMENT_TABS.map((tab) => (
            <div key={tab.key} className={activeTab === tab.key ? "block" : "hidden"}>
              <h3 className="font-semibold text-lg mb-4">{tab.label}</h3>

              <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide mb-2">
                Umumiy ma'lumot
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {DESCRIPTIVE_FIELDS[tab.key].map((f) => (
                  <InputText
                    key={f.name}
                    labelTitle={f.label}
                    type={f.type}
                    name={`${tab.blobKey}.${f.name}`}
                    defaultValue={val[tab.blobKey]?.[f.name]}
                    updateFormValue={updateFormValuePath}
                  />
                ))}
              </div>

              <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide mb-2">
                Texnik parametrlar (FIS uchun nominal qiymatlar)
              </h4>
              <p className="text-xs text-gray-400 italic mb-3">
                Diqqat: tebranish, harorat kabi dinamik qiymatlar sensorlardan avtomatik
                keladi — bu yerda kiritilmaydi.
              </p>
              {STATIC_PARAM_GROUPS[tab.equipmentType].map((group) => (
                <div key={group.title} className="mb-5">
                  <div className="text-xs font-semibold text-gray-600 mb-2">{group.title}</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.fields.map((f) => (
                      <div key={f.key} className="form-control w-full">
                        <label className="label py-1">
                          <span className="label-text text-base-content text-sm">
                            {f.label} {f.unit && <span className="text-gray-400">({f.unit})</span>}
                          </span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          className="input input-bordered input-sm w-full"
                          value={staticVals[tab.equipmentType][f.key]}
                          onChange={(e) => updateStaticValue(tab.equipmentType, f.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="mt-8">
            <Button name={saving ? "Saqlanmoqda..." : "Saqlash"} btnStyle="btn-primary" onPress={Submit} />
            <Button name="Bekor qilish" btnStyle="btn-ghost" navigate={-1} />
          </div>
        </>
      )}
    </TitleCard>
  );
}

export default AggregatesStaticForm;
