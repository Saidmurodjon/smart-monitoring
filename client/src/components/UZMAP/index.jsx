import React, { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoMercator, geoPath } from "d3-geo";
import { useNavigate } from "react-router-dom";
import uzbekistanMap from "../../data/uzbekistan.geo.json";

const VIEW_PADDING = 30;
const VIEW_MAX_DIMENSION = 900;

const STATUS_LEGEND = [
  { label: "A'lo", className: "bg-green-500" },
  { label: "Yaxshi", className: "bg-yellow-500" },
  { label: "Yomon", className: "bg-red-500" },
];

export default function UzbekistanMap() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  // Auto-fit the projection to the geography so the ENTIRE country is always
  // visible with no clipping. The viewbox itself is shaped to match the
  // country's real projected aspect ratio (measured, not guessed), so "meet"
  // scaling wastes as little space as possible and the map renders as large
  // as the container allows.
  const { projection, viewWidth, viewHeight } = useMemo(() => {
    const reference = geoMercator().fitSize([1000, 1000], uzbekistanMap);
    const [[x0, y0], [x1, y1]] = geoPath(reference).bounds(uzbekistanMap);
    const aspect = (x1 - x0) / (y1 - y0);

    const width = aspect >= 1 ? VIEW_MAX_DIMENSION : Math.round(VIEW_MAX_DIMENSION * aspect);
    const height = aspect >= 1 ? Math.round(VIEW_MAX_DIMENSION / aspect) : VIEW_MAX_DIMENSION;

    return {
      viewWidth: width,
      viewHeight: height,
      projection: geoMercator().fitExtent(
        [
          [VIEW_PADDING, VIEW_PADDING],
          [width - VIEW_PADDING, height - VIEW_PADDING],
        ],
        uzbekistanMap
      ),
    };
  }, []);

  const gesLocations = [
    { _id: "68fc5c2daab7c0634166ed82", name: "Chorvoq GES", coordinates: [69.95, 41.63], status: "A'lo", desc: "To'liq quvvatda ishlayapti." },
    { name: "Tuyamo‘yin GES", coordinates: [62.33, 41.0], status: "Yaxshi", desc: "Profilaktik ta’mir o'tkazilgan." },
    { name: "Andijon GES", coordinates: [72.35, 40.8], status: "Yomon", desc: "Avariya rejimida ishlamoqda." },
    { name: "G‘issar GES", coordinates: [66.25, 38.75], status: "Yaxshi", desc: "Ishlayapti, barqaror holatda." },
  ];

  const getStatusColor = (status) =>
    status === "A'lo"
      ? "fill-green-500"
      : status === "Yaxshi"
        ? "fill-yellow-500"
        : status === "Yomon"
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
              key={ges.name}
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
