'use client';

import { useEffect, useMemo, useRef } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { fmt, median } from '@/lib/format';
import type { Discom, IndiaGeoJSON } from '@/lib/types';

interface Props {
  name: string;
  x: number;
  y: number;
  discoms: Discom[];
  year: string;
  stateHue: Record<string, string>;
  geojson: IndiaGeoJSON;
  onClose: () => void;
  onViewFullReport: (name: string) => void;
}

/** Small callout that appears where a state was clicked on the hero map — a state-outline
 * watermark, a few headline numbers, and a way out to the full per-state report. Closing it
 * (✕, outside click, Escape) just clears the selection via onClose, so it stays in sync with
 * whatever else is watching compareSet (no separate open/closed state to desync). */
export default function StatePopup({ name, x, y, discoms, year, stateHue, geojson, onClose, onViewFullReport }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onDocPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const outlinePath = useMemo(() => {
    const feature = geojson.features.find((f) => f.properties.st_nm === name);
    if (!feature) return null;
    const proj = geoMercator().fitExtent(
      [
        [8, 8],
        [212, 132],
      ],
      feature as never
    );
    return geoPath(proj)(feature as never);
  }, [geojson, name]);

  const ds = discoms.filter((d) => d.state === name);
  const withYear = ds.map((d) => d.years[year]).filter(Boolean) as NonNullable<Discom['years'][string]>[];
  const reportingCount = withYear.filter((y) => y.scoring.data_reported_pct > 0).length;
  const saidis = withYear.map((y) => y.indicators.SAIDI?.value).filter((v): v is number => v != null);
  const saifis = withYear.map((y) => y.indicators.SAIFI?.value).filter((v): v is number => v != null);

  return (
    <div className="state-popup" ref={rootRef} style={{ left: x, top: y }}>
      <svg className="state-popup-outline" viewBox="0 0 220 140" aria-hidden="true">
        {outlinePath && <path d={outlinePath} />}
      </svg>
      <button type="button" className="state-popup-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <div className="state-popup-head">
        <span className="dot" style={{ background: stateHue[name] || '#999' }} />
        <h4>{name}</h4>
      </div>
      <p className="state-popup-hint">
        FY {year} · {reportingCount} of {ds.length} DISCOMs reporting
      </p>
      <div className="state-popup-rows">
        <div className="report-row">
          <span className="k">SAIDI median</span>
          <span className="v">{fmt(median(saidis), 2)} h</span>
        </div>
        <div className="report-row">
          <span className="k">SAIFI median</span>
          <span className="v">{fmt(median(saifis), 2)} /yr</span>
        </div>
      </div>
      <button type="button" className="state-popup-cta" onClick={() => onViewFullReport(name)}>
        See full report →
      </button>
    </div>
  );
}
