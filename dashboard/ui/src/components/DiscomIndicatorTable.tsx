'use client';

import { fmt, fyLabel, UNIT_LABEL } from '@/lib/format';
import type { Discom, DiscomsData } from '@/lib/types';

interface Props {
  discomsData: DiscomsData;
  discom: Discom;
  year: string;
}

/** Full raw reported detail for one DISCOM/year: every tracked indicator's reported value and
 * benchmark (each with the source sheet's own "meaning" remark alongside it), whether the two
 * are comparable, and whether the standard was met — straight from the extracted data, with no
 * derived score/grade layered on top. Shared by the per-state page and the Scorecards Report's
 * per-state listing so both show the same thing. */
export default function DiscomIndicatorTable({ discomsData, discom, year }: Props) {
  const y = discom.years[year];
  const keys = discomsData.canonical_order;

  return (
    <table className="detail-table">
      <thead>
        <tr>
          <th>Indicator</th>
          <th>Reported ({fyLabel(year)})</th>
          <th>Benchmark</th>
          <th>Comparable?</th>
          <th>Standard Met?</th>
        </tr>
      </thead>
      <tbody>
        {keys.map((key) => {
          const ind = y?.indicators[key];
          if (!ind) {
            return (
              <tr key={key}>
                <td style={{ fontWeight: 500 }}>{key}</td>
                <td colSpan={4} style={{ color: 'var(--muted)' }}>
                  No block reported for {fyLabel(year)}
                </td>
              </tr>
            );
          }
          const unit = UNIT_LABEL[discomsData.canonical_indicators[key].unit];
          const reported = ind.value == null ? 'N/A' : fmt(ind.value, 2) + (unit === '%' ? '%' : ' ' + unit);
          const bench =
            ind.benchmark == null || Number.isNaN(parseFloat(ind.benchmark)) ? 'N/A' : fmt(parseFloat(ind.benchmark), 2) + (unit === '%' ? '%' : ' ' + unit);
          const comparable = ind.comparison_possible === true ? 'Yes' : ind.comparison_possible === false ? 'No' : 'N/A';
          const met = ind.standard_met === true ? 'Yes' : ind.standard_met === false ? 'No' : 'N/A';
          return (
            <tr key={key}>
              <td style={{ fontWeight: 500 }}>{key}</td>
              <td>
                {reported}
                <div className="meaning">{ind.reported_meaning || 'N/A'}</div>
              </td>
              <td>
                {bench}
                <div className="meaning">{ind.benchmark_meaning || 'N/A'}</div>
              </td>
              <td>{comparable}</td>
              <td>{met}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
