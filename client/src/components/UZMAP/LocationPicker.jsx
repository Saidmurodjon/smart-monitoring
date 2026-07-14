import React, { useCallback } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import uzbekistanMap from "../../data/uzbekistan.geo.json";
import useUzbekistanProjection from "./useUzbekistanProjection";

// Lets the user click anywhere on the Uzbekistan map to pick a GES's
// coordinates. Uses the SVG's screen<->user-space transform (getScreenCTM)
// so the click position is correct regardless of how the map is scaled by
// CSS, then inverts the same d3 projection used to draw the map to recover
// [longitude, latitude].
export default function GesLocationPicker({ latitude, longitude, onPick }) {
  const { projection, viewWidth, viewHeight } = useUzbekistanProjection();

  const handleClick = useCallback(
    (e) => {
      const svg = e.currentTarget;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;

      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const svgPoint = point.matrixTransform(ctm.inverse());

      const coords = projection.invert([svgPoint.x, svgPoint.y]);
      if (!coords || Number.isNaN(coords[0]) || Number.isNaN(coords[1])) return;

      onPick({ longitude: +coords[0].toFixed(5), latitude: +coords[1].toFixed(5) });
    },
    [projection, onPick]
  );

  const hasPoint = typeof latitude === "number" && typeof longitude === "number";

  return (
    <div
      className="relative w-full max-w-md bg-base-200 rounded-lg overflow-hidden border border-base-300"
      style={{ aspectRatio: `${viewWidth} / ${viewHeight}` }}
    >
      <ComposableMap
        projection={projection}
        width={viewWidth}
        height={viewHeight}
        className="w-full h-full cursor-crosshair"
        onClick={handleClick}
      >
        <Geographies geography={uzbekistanMap}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                className="outline-0"
                style={{
                  default: { fill: "var(--map-land-fill)", stroke: "var(--map-land-stroke)", strokeWidth: 0.7 },
                  hover: { fill: "var(--map-land-fill)", stroke: "var(--map-land-stroke)", strokeWidth: 0.7 },
                }}
              />
            ))
          }
        </Geographies>

        {hasPoint && (
          <Marker coordinates={[longitude, latitude]}>
            <circle r={7} className="fill-primary stroke-white stroke-[2px]" />
          </Marker>
        )}
      </ComposableMap>
    </div>
  );
}
