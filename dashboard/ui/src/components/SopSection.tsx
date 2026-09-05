'use client';

import Collapsible from './Collapsible';
import { CATEGORICAL } from '@/lib/colors';
import { fmt, fyLabel } from '@/lib/format';
import type { SopIndicator, StateSpecificData } from '@/lib/types';

interface Props {
  stateSpecific: StateSpecificData;
  stateName: string;
  /** Both driven by the one page-level filter bar in StateDetail — this section never owns its
   * own year/DISCOM selection, so every part of the page always agrees on what's showing. */
  activeYear: string;
  discomFilter: string;
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

export default function SopSection({ stateSpecific, stateName, activeYear, discomFilter }: Props) {
  const allDiscomsForState = stateSpecific.discoms.filter((d) => d.state === stateName);
  const discomsForState = discomFilter === 'all' ? allDiscomsForState : allDiscomsForState.filter((d) => d.short_name === discomFilter);
  const framework = stateSpecific.frameworks.find((f) => f.state === stateName);

  // same fixed-order categorical hue each DISCOM already carries on its scorecard/chart line in
  // the reliability report above, so the SoP accordion's chip reads as the same DISCOM — indexed
  // against the full (unfiltered) list so a color never shifts when the DISCOM filter narrows it.
  const cols = allDiscomsForState.map((_, i) => CATEGORICAL[i]);

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

          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {discomsForState.map((d, i) => {
              const y = d.years[activeYear];
              const color = cols[allDiscomsForState.indexOf(d)];
              return (
                <Collapsible key={d.sheet} label={d.short_name} meta={d.full_name} color={color} animationDelay={i * 60}>
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
