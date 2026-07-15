import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import Button from "../../components/buttons/Button";
import { useSearchParams } from "react-router-dom";
import http from "../../utils/http";
import TransformerAnimation from "./animations/TransformerAnimation";
import HydroTurbineAnimation from "./animations/HydroTurbineAnimation";
import HydroGeneratorAnimation from "./animations/HydroGeneratorAnimation";
import State from "../../components/buttons/State";

// Live sensor qiymatini (va, bo'lsa, nominal statik qiymatni) ko'rsatadi.
function ReadoutRow({ label, live, nominal, unit }) {
  const hasLive = live !== undefined && live !== null;
  return (
    <div className="flex justify-between items-baseline">
      <span>{label}</span>
      <span className="text-right">
        {hasLive ? (
          <span>
            {live} {unit}
          </span>
        ) : (
          <span className="text-sm text-gray-400 italic">Ma'lumot yo'q</span>
        )}
        {nominal !== undefined && nominal !== null && (
          <span className="block text-xs text-gray-400">nominal: {nominal} {unit}</span>
        )}
      </span>
    </div>
  );
}

function StatusRow({ label, entry }) {
  return (
    <div className="flex justify-between">
      <span className="font-semibold">{label}</span>
      {entry ? (
        <State status={entry.status} />
      ) : (
        <span className="text-xs text-gray-400 italic">Hali baholanmagan</span>
      )}
    </div>
  );
}

function Transactions() {
  const [searchParams] = useSearchParams();
  const aggregateId = searchParams.get("aggregateId");

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(Boolean(aggregateId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!aggregateId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    http
      .get(`/aggregates/${aggregateId}/detail`)
      .then(({ data }) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [aggregateId]);

  const staticParams = detail?.staticParams || {};
  const readings = detail?.latestReadings || {};
  const assessment = detail?.assessment || null;

  return (
    <>
      <TitleCard
        title="Aggregat"
        topMargin="mt-2"
        TopSideButtons={
          <Button
            name={"Add new"}
            btnStyle={"btn-primary px-6 btn-sm normal-case"}
            navigate={`./add-new${detail?.gesId ? `?gesId=${detail.gesId}` : ""}`}
          />
        }
      >
        {!aggregateId && (
          <div className="text-gray-500 italic py-6">
            Agregat tanlanmagan — GES sahifasidan bir agregatni tanlang.
          </div>
        )}
        {loading && <div className="py-6">Yuklanmoqda...</div>}
        {error && <div className="text-red-500 py-6">Xatolik: {String(error)}</div>}

        {!loading && !error && detail && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* 1 - Gidroturbina */}
            <div className="bg-base-100 shadow-md rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-center mb-2">Gidroturbina</h2>
                <HydroTurbineAnimation />
                <div className="space-y-2 text-xl">
                  <StatusRow label="Texnik holati" entry={assessment?.turbine} />
                  <ReadoutRow
                    label="Aylanish tezligi"
                    live={readings.TURBINE?.aylanishTezligi}
                    nominal={staticParams.TURBINE?.aylanishTezligi}
                    unit="ayl/daq"
                  />
                  <ReadoutRow
                    label="Quvvat"
                    live={readings.TURBINE?.quvvat}
                    nominal={staticParams.TURBINE?.quvvat}
                    unit="MVt"
                  />
                  <ReadoutRow
                    label="Suv sarfi"
                    live={readings.TURBINE?.suvSarfi}
                    nominal={staticParams.TURBINE?.suvSarfi}
                    unit="m³/s"
                  />
                  <ReadoutRow label="Tebranish" live={readings.TURBINE?.tebranish} unit="mkm" />
                </div>
              </div>
            </div>

            {/* 2 - Gidrogenerator */}
            <div className="bg-base-100 shadow-md rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-center mb-4">Gidrogenerator</h2>
                <HydroGeneratorAnimation />
                <div className="space-y-2 text-xl">
                  <StatusRow label="Texnik holati" entry={assessment?.generator} />
                  <StatusRow label="Elektr qism (f1)" entry={assessment?.details?.f1} />
                  <StatusRow label="Noelektr qism (f2)" entry={assessment?.details?.f2} />
                  <ReadoutRow
                    label="Stator harorati"
                    live={readings.GENERATOR?.statorHarorati}
                    unit="°C"
                  />
                  <ReadoutRow label="Tebranish" live={readings.GENERATOR?.tebranish} unit="mkm" />
                </div>
              </div>
            </div>

            {/* 3 - Transformator */}
            <div className="bg-base-100 shadow-md rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-center mb-4">Transformator</h2>
                <TransformerAnimation />
                <div className="space-y-2 text-xl">
                  <StatusRow label="Texnik holati" entry={assessment?.transformer} />
                  <StatusRow label="Chulg'am texnik holati" entry={assessment?.details?.f3} />
                  <StatusRow label="Izolyatsiya holati" entry={assessment?.details?.f4} />
                  <StatusRow label="Noelektrik qism" entry={assessment?.details?.f6} />
                  <ReadoutRow
                    label="Transformator harorati"
                    live={readings.TRANSFORMER?.transformatorHarorati}
                    unit="°C"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </TitleCard>
    </>
  );
}

export default Transactions;
