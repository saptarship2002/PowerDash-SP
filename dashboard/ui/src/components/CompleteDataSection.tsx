'use client';

import { useState } from 'react';
import { CATEGORICAL } from '@/lib/colors';
import { fyLabel } from '@/lib/format';
import Collapsible from './Collapsible';
import DiscomIndicatorTable from './DiscomIndicatorTable';
import SopIndicatorTable from './SopIndicatorTable';
import type { Discom, DiscomsData, StateSpecificData } from '@/lib/types';

interface Props {
  discomsData: DiscomsData;
  ds: Discom[];
  cols: string[];
  /** Every fiscal year in the dataset, most-recent first — "Complete Data" defaults to showing
   * every one of these rather than silently narrowing to the page's Focus Year. */
  years: string[];
  focusYear: string;
  stateSpecific: StateSpecificData | null;
  stateName: string;
  discomFilter: string;
  /** Narrows the reliability table to the page-level Indicator Type/Indicator filter's scope —
   * so picking SAIDI up top shows only SAIDI's row down here too, not every tracked indicator. */
  indicatorKeys: string[];
}

/** Every full raw table for this state, in one place at the bottom of the page — the only spot on
 * the page where conventional data tables appear. The chart gallery above already communicates
 * meaning/benchmark/comparability/compliance visually per indicator; this section exists purely
 * so the complete original source data stays reachable, unabridged. Defaults to every fiscal year
 * (not just the Focus Year) so "Complete Data" actually means complete — a toggle narrows it to
 * one year for a quicker read when that's all that's needed. */
export default function CompleteDataSection({ discomsData, ds, cols, years, focusYear, stateSpecific, stateName, discomFilter, indicatorKeys }: Props) {
  const [openReliability, setOpenReliability] = useState<Set<string>>(new Set());
  const [openSop, setOpenSop] = useState<Set<string>>(new Set());
  const [showAllYears, setShowAllYears] = useState(true);
  const visibleYears = showAllYears ? years : [focusYear];

  const allDiscomsForState = stateSpecific?.discoms.filter((d) => d.state === stateName) ?? [];
  const discomsForState = discomFilter === 'all' ? allDiscomsForState : allDiscomsForState.filter((d) => d.short_name === discomFilter);
  const sopCols = allDiscomsForState.map((_, i) => CATEGORICAL[i]);
  const framework = stateSpecific?.frameworks.find((f) => f.state === stateName);

  const toggle = (setter: typeof setOpenReliability, sheet: string, isOpen: boolean) =>
    setter((prev) => {
      const next = new Set(prev);
      if (isOpen) next.add(sheet);
      else next.delete(sheet);
      return next;
    });

  return (
    <div className="complete-data-band">
      <div className="section-header">
        <span className="section-label">Complete Data</span>
        <span className="section-title">Full Source Detail</span>
        <span className="section-sub">Every source field as extracted from the workbooks</span>
      </div>

      <div className="complete-data-toggle">
        <span>{showAllYears ? `Showing all ${years.length} fiscal years` : `Focused on ${fyLabel(focusYear)}`}</span>
        <button type="button" className="complete-data-toggle-btn" onClick={() => setShowAllYears((v) => !v)}>
          {showAllYears ? `Show ${fyLabel(focusYear)} only` : 'Show all years'}
        </button>
      </div>

      {ds.length > 0 && (
        <section className="panel" id="sec-complete-reliability">
          <div className="panel-head">
            <div>
              <h3 style={{ fontSize: 17 }}>Reliability &amp; Power Quality — Complete Data</h3>
              <div className="panel-hint">Every tracked indicator alongside its benchmark, source-meaning included</div>
            </div>
          </div>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ds.map((d, i) => (
              <Collapsible
                key={d.sheet}
                label={d.short_name}
                meta={d.full_name}
                color={cols[i]}
                animationDelay={i * 40}
                open={openReliability.has(d.sheet)}
                onOpenChange={(isOpen) => toggle(setOpenReliability, d.sheet, isOpen)}
              >
                <div style={{ overflowX: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {visibleYears.map((y) => (
                    <div key={y}>
                      {showAllYears && <div className="complete-data-year-label">{fyLabel(y)}</div>}
                      <DiscomIndicatorTable discomsData={discomsData} discom={d} year={y} indicatorKeys={indicatorKeys} />
                    </div>
                  ))}
                </div>
              </Collapsible>
            ))}
          </div>
        </section>
      )}

      {(discomsForState.length > 0 || framework) && (
        <section className="panel" id="sec-complete-sop" style={{ marginTop: 16 }}>
          <div className="panel-head">
            <div>
              <h3 style={{ fontSize: 17 }}>Standards of Performance — Complete Data</h3>
              <div className="panel-hint">One row per SoP indicator notified by the state SERC</div>
            </div>
          </div>

          {discomsForState.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {discomsForState.map((d, i) => {
                const color = sopCols[allDiscomsForState.indexOf(d)];
                return (
                  <Collapsible
                    key={d.sheet}
                    label={d.short_name}
                    meta={d.full_name}
                    color={color}
                    animationDelay={i * 40}
                    open={openSop.has(d.sheet)}
                    onOpenChange={(isOpen) => toggle(setOpenSop, d.sheet, isOpen)}
                  >
                    <div style={{ overflowX: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {visibleYears.map((y) => {
                        const yData = d.years[y];
                        return (
                          <div key={y}>
                            {showAllYears && <div className="complete-data-year-label">{fyLabel(y)}</div>}
                            {yData ? <SopIndicatorTable indicators={yData.indicators} showReported /> : <p className="detail-placeholder">No SoP data reported for {fyLabel(y)}.</p>}
                          </div>
                        );
                      })}
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}

          {framework && (
            <div style={{ marginTop: discomsForState.length ? 16 : 6 }}>
              <div className="panel-hint" style={{ marginBottom: 10 }}>
                {stateName}&rsquo;s regulatory framework — no licensee performance figures available
              </div>
              <Collapsible label={stateName} meta={`${framework.indicators.length} notified indicators, no reported data`}>
                <div style={{ overflowX: 'auto' }}>
                  <SopIndicatorTable indicators={framework.indicators} showReported={false} />
                </div>
              </Collapsible>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
