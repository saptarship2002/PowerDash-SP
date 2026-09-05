'use client';

import { useMemo, useState } from 'react';
import { CATEGORICAL } from '@/lib/colors';
import { fmt } from '@/lib/format';
import { buildSopSeries } from '@/lib/sop';
import IndicatorVisualCard, { type CardSeries } from './IndicatorVisualCard';
import FrameworkOnlyCard from './FrameworkOnlyCard';
import type { StateSpecificData } from '@/lib/types';

interface Props {
  stateSpecific: StateSpecificData;
  stateName: string;
  activeYear: string;
  discomFilter: string;
  yearsAsc: string[];
}

const unitSuffix = (v: number) => fmt(v, 1) + '%';

/** The Standards-of-Performance chart gallery — one IndicatorVisualCard per DISCOM/indicator
 * series, grouped under a DISCOM subheading, sitting inside the same continuous "visual analysis"
 * section as the reliability charts above it (never interleaved with a data table). SoP indicator
 * names are never normalized across DISCOMs (CLAUDE.md), so each series stays scoped to the one
 * DISCOM that reported it rather than guessing a cross-DISCOM match. */
export default function SopGallery({ stateSpecific, stateName, activeYear, discomFilter, yearsAsc }: Props) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const allDiscomsForState = stateSpecific.discoms.filter((d) => d.state === stateName);
  const discomsForState = discomFilter === 'all' ? allDiscomsForState : allDiscomsForState.filter((d) => d.short_name === discomFilter);
  const framework = stateSpecific.frameworks.find((f) => f.state === stateName);
  const cols = allDiscomsForState.map((_, i) => CATEGORICAL[i]);

  const perDiscomSeries = useMemo(
    () => discomsForState.map((d) => ({ discom: d, color: cols[allDiscomsForState.indexOf(d)], series: buildSopSeries(d, yearsAsc) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [discomsForState, yearsAsc]
  );

  const types = Array.from(new Set(perDiscomSeries.flatMap((g) => g.series.map((s) => s.type).filter((t): t is string => !!t)))).sort();

  const q = search.trim().toLowerCase();
  const matches = (indicator: string | null, type: string | null) => {
    if (typeFilter !== 'all' && type !== typeFilter) return false;
    if (!q) return true;
    return (indicator ?? '').toLowerCase().includes(q) || (type ?? '').toLowerCase().includes(q);
  };

  if (!discomsForState.length && !framework) return null;

  const anyIndicators = perDiscomSeries.some((g) => g.series.length > 0);

  return (
    <>
      <div className="section-header" style={{ marginTop: 40 }}>
        <span className="section-label">Standards of Performance</span>
        <span className="section-title">Consumer Service Compliance</span>
      </div>
      <p className="section-note">
        Whether each licensee restores supply, resolves meter and billing complaints, and processes new connections within the timelines its SERC has
        notified — and whether it actually reported a figure the Commission could check against that standard. Every figure below is shown exactly as
        reported, with nothing computed on top.
      </p>

      {anyIndicators && (
        <div className="sop-gallery-filters">
          <input
            type="search"
            className="sop-search-input"
            placeholder="Search indicators…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search Standards of Performance indicators"
          />
          {types.length > 1 && (
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by indicator type">
              <option value="all">All Indicator Types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {perDiscomSeries.map(({ discom, color, series }) => {
        const visible = series.filter((s) => matches(s.indicator, s.type));
        if (!visible.length) return null;
        return (
          <div key={discom.sheet} className="sop-discom-group">
            <div className="sop-discom-group-title">
              <span className="dot" style={{ background: color }} />
              {discom.short_name}
              {discom.full_name && <span className="sop-discom-group-full"> — {discom.full_name}</span>}
            </div>
            <div className="chart-grid">
              {visible.map((s, idx) => {
                const cardSeries: CardSeries[] = [
                  {
                    label: discom.short_name,
                    color,
                    points: s.points.map((p) => ({
                      year: p.year,
                      value: p.entry?.reported ?? null,
                      benchmark: p.entry?.benchmark ?? null,
                      benchmarkMeaning: p.entry?.benchmark_meaning ?? null,
                      reportedMeaning: p.entry?.reported_meaning ?? null,
                      standardSpecified: p.entry?.standard_specified ?? null,
                      comparisonPossible: p.entry?.comparison_possible ?? null,
                      standardMet: p.entry?.standard_met ?? null,
                      reasonNotComparable: p.entry?.reason_not_comparable ?? null,
                      regulation: discom.years[p.year]?.regulation ?? null,
                    })),
                  },
                ];
                return (
                  <IndicatorVisualCard
                    key={s.key}
                    title={s.indicator || 'Unnamed indicator'}
                    typeLabel={s.type}
                    meaning={s.meaning}
                    unitSuffix={unitSuffix}
                    yAxisLabel="Percentage"
                    yearsAsc={yearsAsc}
                    activeYear={activeYear}
                    series={cardSeries}
                    animationDelay={idx * 60}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {framework && (
        <div className="sop-discom-group">
          <div className="chart-grid">
            <FrameworkOnlyCard framework={framework} stateName={stateName} />
          </div>
        </div>
      )}
    </>
  );
}
