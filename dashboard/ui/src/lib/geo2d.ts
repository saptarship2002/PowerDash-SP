import { geoMercator, geoPath } from 'd3-geo';
import type { IndiaGeoJSON } from './types';

export interface StatePath2D {
  name: string;
  /** SVG path string in the same 0..width / 0..height pixel space as the container. */
  d: string;
  /** Projected centroid, in the same pixel space — used for pylon placement, hover tooltips,
   * and the click-popup anchor point. */
  centroid: [number, number];
}

export interface IndiaProjection2D {
  paths: StatePath2D[];
  byName: Record<string, StatePath2D>;
}

/** Projects the raw India states GeoJSON straight into SVG path strings sized to fill a
 * `width`x`height` box. Re-derives the whole projection each call (d3-geo's fitExtent isn't
 * incremental), so callers should memoize on [geojson, width, height] rather than calling this
 * per render. */
export function buildIndiaPaths(geojson: IndiaGeoJSON, width: number, height: number, marginRatio = 0.025): IndiaProjection2D {
  const mx = width * marginRatio;
  const my = height * marginRatio;
  const projection = geoMercator().fitExtent(
    [
      [mx, my],
      [width - mx, height - my],
    ],
    geojson as never,
  );
  const gp = geoPath(projection);

  const paths: StatePath2D[] = geojson.features.map((f) => ({
    name: f.properties.st_nm,
    d: gp(f as never) ?? '',
    centroid: gp.centroid(f as never) as [number, number],
  }));

  const byName: Record<string, StatePath2D> = {};
  paths.forEach((p) => {
    byName[p.name] = p;
  });

  return { paths, byName };
}
