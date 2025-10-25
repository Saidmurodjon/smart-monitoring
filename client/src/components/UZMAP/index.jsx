import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// JSON faylingizni loyihaga olib keling:
// client/src/data/uzbekistan.geo.json  <-- shu joyga qo'ying
import uzbekistanMap from "../../data/uzbekistan.geo.json";
import { useState } from "react";

export default function UzbekistanMap() {
// GESlar ro'yxati
const gesLocations = [
  {
    name: "Chorvoq GES",
    coordinates: [69.95, 41.63],
    status: "A'lo",
    desc: "To'liq quvvatda ishlayapti, texnik holati barqaror.",
  },
  {
    name: "Tuyamo‘yin GES",
    coordinates: [62.33, 41.0],
    status: "Yaxshi",
    desc: "Rejalashtirilgan profilaktik ta'mir o'tkazilgan.",
  },
  {
    name: "Andijon GES",
    coordinates: [72.35, 40.8],
    status: "Yomon",
    desc: "Avariya rejimida, ayrim agregatlar o'chirilgan.",
  },
  {
    name: "G‘issar GES",
    coordinates: [66.25, 38.75],
    status: "Yaxshi",
    desc: "Ishlayapti, kichik tebranishlar kuzatilgan.",
  },
];

  // Hover qaysi GESda turganini saqlaymiz
  const [hovered, setHovered] = useState(null);

  // Bosilganda modal uchun tanlangan GES
  const [selected, setSelected] = useState(null);


  // Statusga qarab marker rangini aniqlash
  const getStatusColor = (status) => {
    switch (status) {
      case "A'lo":
        return "#22c55e"; // green-500
      case "Yaxshi":
        return "#eab308"; // yellow-500
      case "Yomon":
        return "#ef4444"; // red-500
      default:
        return "#3b82f6"; // fallback blue-500
    }
  }
  const navGes = (ges) => {
  console.log(ges);
  console.log(selected);
  
  }
  return (
    <div className="w-full h-[1220px] rounded-xl p-4">
      <h2 className="text-white mb-2 text-lg font-semibold">
        O‘zbekiston viloyatlari
      </h2>

  <div style={{ width: "100%", height: "100%" }}>
        <ComposableMap
          projection="geoMercator"
          width={1980}          // bazaviy "canvas" eni (px)
          height={400}         // bazaviy balandligi (px)
          style={{
            width: "100%",     // responsive bo'lsin 
            height: "100%",
          }}
          projectionConfig={{
            // Markaz (long, lat) – O‘zbekiston o‘rtasiga yaqinroq
            center: [64.5, 41.2],
            // scale qanchalik katta bo'lsa, xarita shunchalik kattalashadi
            scale: 5000,
          }}
        >
          <Geographies geography={uzbekistanMap}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "#ffffff",
                      stroke: "#444",
                      strokeWidth: 0.7,
                    },
                    hover: {
                      fill: "#22c55e",
                      stroke: "#111",
                      strokeWidth: 1.1,
                    },
                    pressed: {
                      fill: "#16a34a",
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {/* GES nuqtalari */}
          {gesLocations.map((ges) => {
            const isHovered = hovered === ges.name;
            const dotColor = getStatusColor(ges.status);

            return (
              <Marker
                key={ges.name}
                coordinates={ges.coordinates}
                onMouseEnter={() => setHovered(ges.name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  navGes(ges);
                  // setSelected(ges);
                }}
              >
                {/* Nuqta (circle) */}
                <circle
                  r={10}
                  fill={dotColor}
                  stroke="#fff"
                  strokeWidth={2}
                />

                {/* Nomi */}
                <text
                  textAnchor="start"
                  x={10}
                  y={-5}
                  style={{
                    fontFamily: "sans-serif",
                    fontWeight: 600,
                    fill: "#111827", // gray-900
                    fontSize: isHovered ? 34 : 15, // hover -> kattaroq
                    // transition: "all 0.15s ease-in-out",
                    pointerEvents: "none",
                      hover:{
                      fontSize:50
                    }
                  }}
                >
                  {ges.name}
                </text>

                {/* Holati (A'lo / Yaxshi / Yomon) */}
                <text
                  textAnchor="start"
                  x={10}
                  y={10}
                  style={{
                    fontFamily: "sans-serif",
                    fill: "#4B5563", // gray-600
                    fontSize: isHovered ? 30 : 12,
                    fontWeight: 500,
                    transition: "all 0.15s ease-in-out",
                    pointerEvents: "none",
                  
                  }}
                >
                  {ges.status}
                </text>
              </Marker>
            );
          })}

        </ComposableMap>
      </div>
    </div>
  );
}
