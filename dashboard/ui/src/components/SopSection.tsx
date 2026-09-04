'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Collapsible from './Collapsible';
import { CATEGORICAL } from '@/lib/colors';
import { fmt, fyLabel } from '@/lib/format';
import type { SopIndicator, StateSpecificData } from '@/lib/types';

interface Props {
  stateSpecific: StateSpecificData;
  stateName: string;
}

function MetPill({ met }: { met: boolean | null }) {
  if (met === true) return <span className="status-pill status-met">Met</span>;
  if (met === false) return <span className="status-pill status-missed">Missed</span>;
  return <span className="status-pill status-none">N/A</span>;
}

/** Raw reported detail only — no derived score, grade, or percentage of any kind. Every value
 * shown here is either lifted straight from the source workbook or a plain count of rows. */
function IndicatorTable({ indicators, showReported }: { indicators: SopIndicator[]; showReported: boolean }) {
  return (
    <table className="detail-table">
      <thead>
        <tr>
          <th>Indicator</th>
          <th>Standard</th>
          <th>Benchmark</th>
          {showReported && <th>Reported</th>}
          {showReported && <th>Standard Met?</th>}
        </tr>
      </thead>
      <tbody>
        {indicators.map((ind, i) => (
          <tr key={i}>
            <td style={{ fontWeight: 500 }}>
              {ind.indicator || 'N/A'}
              <div className="meaning">{ind.type || 'N/A'}</div>
            </td>
            <td>
              <div className="meaning">{ind.standard_specified || 'N/A'}</div>
            </td>
            <td>
              {ind.benchmark == null ? 'N/A' : fmt(ind.benchmark, 1) + '%'}
              <div className="meaning">{ind.benchmark_meaning || 'N/A'}</div>
            </td>
            {showReported && (
              <td>
                {ind.reported == null ? 'N/A' : fmt(ind.reported, 1) + '%'}
                <div className="meaning">{ind.reported_meaning || ind.reason_not_comparable || 'N/A'}</div>
              </td>
            )}
            {showReported && (
              <td>
                <MetPill met={ind.standard_met} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function YearPicker({ years, active, onChange }: { years: string[]; active: string; onChange: (y: string) => void }) {
  // earliest year first, left to right (ascending)
  const ordered = [...years].sort((a, b) => (a < b ? -1 : 1));
  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [slider, setSlider] = useState<{ left: number; width: number } | null>(null);

  // measured from the actual active button rather than assumed from index * fixed-width, so the
  // swipe lands exactly under the label regardless of how wide "2025-26" renders vs "2021-22"
  useLayoutEffect(() => {
    const track = trackRef.current;
    const btn = btnRefs.current[active];
    if (!track || !btn) return;
    const trackRect = track.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setSlider({ left: btnRect.left - trackRect.left, width: btnRect.width });
  }, [active, years.join(',')]);

  return (
    <div className="year-picker">
      <span className="yp-label">Financial Year</span>
      <div className="yp-years" ref={trackRef}>
        {slider && <span className="yp-slider" style={{ left: slider.left, width: slider.width }} />}
        {ordered.map((y) => (
          <button
            key={y}
            type="button"
            ref={(el) => {
              btnRefs.current[y] = el;
            }}
            className={y === active ? 'active' : ''}
            onClick={() => onChange(y)}
            aria-pressed={y === active}
          >
            {fyLabel(y)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SopSection({ stateSpecific, stateName }: Props) {
  const discomsForState = stateSpecific.discoms.filter((d) => d.state === stateName);
  const framework = stateSpecific.frameworks.find((f) => f.state === stateName);

  // only years for which at least one of this state's licensees actually has a SoP block —
  // the picker should never offer a year with nothing to show for this particular state.
  const availableYears = stateSpecific.years.filter((y) => discomsForState.some((d) => d.years[y]));
  const defaultYear = availableYears.includes('2023-24') ? '2023-24' : availableYears[0];
  const [activeYear, setActiveYear] = useState(defaultYear);

  // same fixed-order categorical hue each DISCOM already carries on its scorecard/chart line in
  // the reliability report above, so the SoP accordion's chip reads as the same DISCOM.
  const cols = CATEGORICAL.slice(0, discomsForState.length);

  if (!discomsForState.length && !framework) return null;

  return (
    <>
      <div className="section-header" style={{ marginTop: 32 }}>
        <span className="section-label">Standards of Performance</span>
        <span className="section-title">Consumer Service Compliance</span>
      </div>
      <p className="section-note">
        Whether each licensee restores supply, resolves meter and billing complaints, and processes new connections within the timelines its SERC has
        notified — and whether it actually reported a figure the Commission could check against that standard. This sits alongside the
        reliability/power-quality report above, focused on consumer service rather than supply quality. Every figure below is shown exactly as
        reported, with nothing computed on top.
      </p>

      {discomsForState.length > 0 && (
        <section className="panel" id="sec-sop">
          <div className="panel-head">
            <div>
              <h3 style={{ fontSize: 17 }}>Reported Indicator Detail</h3>
              <div className="panel-hint">One row per SoP indicator notified by the state SERC</div>
            </div>
          </div>

          {availableYears.length > 1 && (
            <div className="year-picker-sticky">
              <YearPicker years={availableYears} active={activeYear} onChange={setActiveYear} />
            </div>
          )}

          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {discomsForState.map((d, i) => {
              const y = d.years[activeYear];
              return (
                <Collapsible key={d.sheet} label={d.short_name} meta={d.full_name} color={cols[i]} animationDelay={i * 60}>
                  <div style={{ overflowX: 'auto' }}>
                    {y ? (
                      <IndicatorTable indicators={y.indicators} showReported />
                    ) : (
                      <p className="detail-placeholder">No SoP data reported for {fyLabel(activeYear)}.</p>
                    )}
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </section>
      )}

      {framework && (
        <section className="panel" id="sec-sop-framework" style={{ marginTop: discomsForState.length ? 16 : 0 }}>
          <div className="panel-head">
            <div>
              <h3 style={{ fontSize: 17 }}>Regulatory Framework Only</h3>
              <div className="panel-hint">
                {stateName}&rsquo;s SERC has notified {framework.indicators.length} SoP indicators with standards and benchmarks, but no licensee
                performance figures were available in the source workbook.
              </div>
            </div>
          </div>
          <div className="no-data-box" style={{ marginTop: 14, marginBottom: 14, textAlign: 'left' }}>
            {framework.regulation}
          </div>
          <Collapsible label={stateName} meta={`${framework.indicators.length} notified indicators, no reported data`}>
            <div style={{ overflowX: 'auto' }}>
              <IndicatorTable indicators={framework.indicators} showReported={false} />
            </div>
          </Collapsible>
        </section>
      )}
    </>
  );
}
