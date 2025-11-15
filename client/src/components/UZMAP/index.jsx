import React, { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useNavigate } from "react-router-dom";
import uzbekistanMap from "../../data/uzbekistan.geo.json";

export default function UzbekistanMap() {
  const navigate = useNavigate();

  const gesLocations = [
    { _id:"68fc5c2daab7c0634166ed82", name: "Chorvoq GES", coordinates: [69.95, 41.63], status: "A'lo", desc: "To'liq quvvatda ishlayapti." },
    { name: "Tuyamo‘yin GES", coordinates: [62.33, 41.0], status: "Yaxshi", desc: "Profilaktik ta’mir o'tkazilgan." },
    { name: "Andijon GES", coordinates: [72.35, 40.8], status: "Yomon", desc: "Avariya rejimida ishlamoqda." },
    { name: "G‘issar GES", coordinates: [66.25, 38.75], status: "Yaxshi", desc: "Ishlayapti, barqaror holatda." },
  ];

  const [hovered, setHovered] = useState(null);

  const getStatusColor = (status) =>
    status === "A'lo"
      ? "fill-green-500"
      : status === "Yaxshi"
        ? "fill-yellow-500"
        : status === "Yomon"
          ? "fill-red-500"
          : "fill-blue-500";

  const handleClick = (ges) => {
    navigate(`/app/ges?id=${ges? ges?._id : ""}`, { state: { ges } });
  };

  return (
    <div className="w-full h-[1150px] rounded-xl p-4">
      <h2 className="text-white mb-2 text-lg font-semibold">O‘zbekiston viloyatlari</h2>

      <ComposableMap
        projection="geoMercator"
        width={1980}
        height={400}
        className="w-full h-full"
        projectionConfig={{ center: [64.5, 41.2], scale: 5000 }}
         >
        <Geographies geography={uzbekistanMap}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                // geo.properties.name
                
                onClick={()=> navigate("/app/ges-list", { state: { geo } })}
                className="transition-all duration-200 border-0 outline-0 shadow-none"
                style={{
                  default: { fill: "#fff", stroke: "#444", strokeWidth: 0.7 },
                  hover: { fill: "#22c55e", stroke: "#111", strokeWidth: 1.1 },
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
                className={`font-semibold fill-gray-700 select-none transition-all duration-200 ${isHovered ? "text-[34px]" : "text-[25px]"
                  }`}
              >
                {ges.name}
              </text>

              {/* <text
                textAnchor="start"
                x={14}
                y={12}
                onClick={() => handleClick(ges)}
                className={`fill-gray-600 select-none transition-all duration-200 ${isHovered ? "text-[30px]" : "text-[22px]"
                  }`}
              >
                {ges.status}
              </text> */}
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
}
