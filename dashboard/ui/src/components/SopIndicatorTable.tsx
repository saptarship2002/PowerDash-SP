import { fmt } from '@/lib/format';
import type { SopIndicator } from '@/lib/types';

function MetPill({ met }: { met: boolean | null }) {
  if (met === true) return <span className="status-pill status-met">Met</span>;
  if (met === false) return <span className="status-pill status-missed">Missed</span>;
  return <span className="status-pill status-none">N/A</span>;
}

/** Raw reported detail only — no derived score, grade, or percentage of any kind. Every value
 * shown here is either lifted straight from the source workbook or a plain count of rows. Used
 * only in the Complete Data section (and the framework-only card's own progressive-disclosure
 * listing) — the chart gallery communicates the same fields visually instead. */
export default function SopIndicatorTable({ indicators, showReported }: { indicators: SopIndicator[]; showReported: boolean }) {
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
