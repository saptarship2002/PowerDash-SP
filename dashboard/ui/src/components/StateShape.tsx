'use client';

import { useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { IndiaGeoJSON } from '@/lib/types';

interface Props {
  geojson: IndiaGeoJSON;
  name: string;
  size?: number;
  color: string;
}

/** An isolated silhouette of a single state, cropped to its own bounds rather than its
 * position within India — used where a state needs to read as its own small icon (e.g. a
 * comparison header) rather than as a piece of the full map. */
export default function StateShape({ geojson, name, size = 72, color }: Props) {
  const d = useMemo(() => {
    const feature = geojson.features.find((f) => f.properties.st_nm === name);
    if (!feature) return null;
    const pad = size * 0.08;
    const proj = geoMercator().fitExtent(
      [
        [pad, pad],
        [size - pad, size - pad],
      ],
      feature as never
    );
    return geoPath(proj)(feature as never);
  }, [geojson, name, size]);

  if (!d) return null;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="state-shape" aria-hidden="true">
      <path d={d} fill={color} fillOpacity={0.82} stroke="rgba(255,255,255,0.55)" strokeWidth={1} strokeLinejoin="round" />
    </svg>
  );
}
