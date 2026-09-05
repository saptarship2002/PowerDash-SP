'use client';

import { fyLabel } from '@/lib/format';
import { evidenceStatus, STATUS_META } from '@/lib/evidenceStatus';
import type { CardPoint } from './IndicatorVisualCard';

interface Props {
  yearsAsc: string[];
  points: CardPoint[];
  unitSuffix: (v: number) => string;
  seriesLabel?: string;
  color?: string;
  hoverYear: string | null;
  focusYear: string;
  onHoverYear: (year: string | null) => void;
}

/** One compact, evenly-spaced row spanning the chart's full width — reported value + compliance
 * status per fiscal year, replacing what used to be five tall repeated cards. Hovering/focusing a
 * cell becomes the connective tissue between "this point on the chart" and "this year's
 * regulatory evidence": it drives the chart's enlarged point and vertical guide line via
 * `onHoverYear`, falling back to the page-level Focus Year (`focusYear`) once the pointer leaves. */
export default function EvidenceRail({ yearsAsc, points, unitSuffix, seriesLabel, color, hoverYear, focusYear, onHoverYear }: Props) {
  const activeYear = hoverYear ?? focusYear;

  return (
    <div className="evidence-rail">
      {seriesLabel && (
        <span className="evidence-rail-label" style={color ? { color } : undefined}>
          {seriesLabel}
        </span>
      )}
      <div className="evidence-rail-cells" style={{ gridTemplateColumns: `repeat(${yearsAsc.length}, 1fr)` }}>
        {points.map((p) => {
          const status = evidenceStatus(p);
          const meta = STATUS_META[status];
          const isActive = p.year === activeYear;
          return (
            <button
              key={p.year}
              type="button"
              className={`evidence-cell ${meta.cls}${isActive ? ' active' : ''}`}
              onMouseEnter={() => onHoverYear(p.year)}
              onMouseLeave={() => onHoverYear(null)}
              onFocus={() => onHoverYear(p.year)}
              onBlur={() => onHoverYear(null)}
              title={`${fyLabel(p.year)} · ${meta.text}`}
            >
              <span className="evidence-cell-fy">{fyLabel(p.year)}</span>
              <span className="evidence-cell-v">{p.value == null ? '–' : unitSuffix(p.value)}</span>
              <span className="evidence-cell-status">{meta.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
