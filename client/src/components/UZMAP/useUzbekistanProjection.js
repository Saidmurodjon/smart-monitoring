import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import uzbekistanMap from "../../data/uzbekistan.geo.json";

const VIEW_PADDING = 30;
const VIEW_MAX_DIMENSION = 900;

// Auto-fit the projection to the geography so the ENTIRE country is always
// visible with no clipping. The viewbox itself is shaped to match the
// country's real projected aspect ratio (measured, not guessed), so "meet"
// scaling wastes as little space as possible. Shared by the dashboard map
// and the GES location picker so both render identical geometry.
export default function useUzbekistanProjection() {
  return useMemo(() => {
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
}
