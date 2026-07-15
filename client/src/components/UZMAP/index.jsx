import React, { useState, useEffect, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import uzbekistanMap from "../../data/uzbekistan.geo.json";
import useUzbekistanProjection from "./useUzbekistanProjection";
import { fetchGesList, selectGesItems } from "../../features/ges/gesSlice";
import http from "../../utils/http";

const STATUS_LEGEND = [
  { label: "A'lo", className: "bg-green-500" },
  { label: "Yaxshi", className: "bg-yellow-500" },
  { label: "O'rtacha", className: "bg-blue-500" },
  { label: "Yomon", className: "bg-orange-500" },
  { label: "Juda yomon", className: "bg-red-500" },
];

export default function UzbekistanMap() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(null);

  const { projection, viewWidth, viewHeight } = useUzbekistanProjection();

  const items = useSelector(selectGesItems);

  useEffect(() => {
    if (!items || items.length === 0) dispatch(fetchGesList());
  }, [dispatch, items]);

  // Har bir GES uchun haqiqiy Fuzzy Logic (FIS) natijasi — birinchi
  // agregatning GES-darajasidagi bahosi (DB'dan o'qiladi, hisoblamaydi).
  // GES._id bo'yicha xaritalangan: { score, status, assessedAt }
  const [fisStatuses, setFisStatuses] = useState({});

  useEffect(() => {
    const candidates = (items || []).filter((g) => g.aggregates?.length > 0);
    if (candidates.length === 0) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        candidates.map(async (g) => {
          const aggregateId = g.aggregates[0]._id || g.aggregates[0].id;
          try {
            const { data } = await http.get(`/assessment/${aggregateId}/summary`);
            return [g._id, data?.ges || null];
          } catch (err) {
            return [g._id, null];
          }
        })
      );
      if (!cancelled) setFisStatuses(Object.fromEntries(entries));
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

  // Faqat "Dashboardda ko'rinsin" deb belgilangan va joylashuvi (lat/lng)
  // kiritilgan GESlar xaritada marker sifatida chiziladi. Status — agar
  // haqiqiy FIS bahosi mavjud bo'lsa o'sha, aks holda qo'lda kiritilgan
  // (qoralama) status.
  const gesLocations = useMemo(
    () =>
      (items || [])
        .filter((g) => g.isPublished && typeof g.latitude === "number" && typeof g.longitude === "number")
        .map((g) => {
          const fisStatus = fisStatuses[g._id]?.status;
          return {
            _id: g._id,
            name: g.name,
            coordinates: [g.longitude, g.latitude],
            status: fisStatus || g.status,
            desc: [g.region, fisStatus || g.status].filter(Boolean).join(" — "),
          };
        }),
    [items, fisStatuses]
  );

  const getStatusColor = (status) =>
    status === "A'lo"
      ? "fill-green-500"
      : status === "Yaxshi"
        ? "fill-yellow-500"
        : status === "O'rtacha"
          ? "fill-blue-500"
          : status === "Yomon"
            ? "fill-orange-500"
            : status === "Juda yomon"
              ? "fill-red-500"
              : "fill-blue-500";

  const handleClick = (ges) => {
    navigate(`/app/ges?id=${ges ? ges?._id : ""}`, { state: ges });
  };

  return (
    <div className="relative w-full h-full bg-base-200">
      {/* Status legend */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-wrap gap-x-3 gap-y-1 bg-base-100/80 backdrop-blur px-3 py-2 rounded-lg shadow">
        {STATUS_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-base-content">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${item.className}`} />
            {item.label}
          </div>
        ))}
      </div>

      <ComposableMap
        projection={projection}
        width={viewWidth}
        height={viewHeight}
        className="w-full h-full"
      >
        <Geographies geography={uzbekistanMap}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => navigate("/app/ges-list", { state: { geo } })}
                className="transition-all duration-200 border-0 outline-0 shadow-none"
                style={{
                  default: { fill: "var(--map-land-fill)", stroke: "var(--map-land-stroke)", strokeWidth: 0.7 },
                  hover: { fill: "var(--map-land-hover-fill)", stroke: "var(--map-land-hover-stroke)", strokeWidth: 1.1 },
                }}
              />
            ))
          }
        </Geographies>

        {gesLocations.map((ges) => {
          const isHovered = hovered === ges.name;
          return (
            <Marker
              key={ges._id}
              coordinates={ges.coordinates}
              onMouseEnter={() => setHovered(ges.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(ges)}
              className="cursor-pointer"
            >
              <circle
                r={10}
                className={`${getStatusColor(ges.status)} opacity-40 animate-ripple`}
              />

              <circle
                r={6}
                className={`${getStatusColor(ges.status)} stroke-white stroke-[2px]`}
              />
              <text
                textAnchor="start"
                x={14}
                y={-5}
                onClick={() => handleClick(ges)}
                className={`font-semibold fill-current text-base-content select-none transition-all duration-200 ${isHovered ? "text-[34px]" : "text-[25px]"
                  }`}
              >
                {ges.name}
              </text>
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
}
