'use client';

import { representativeBenchmark } from '@/lib/computations';
import { fmt, median, UNIT_LABEL } from '@/lib/format';
import type { Discom, DiscomsData } from '@/lib/types';

interface Props {
  discoms: DiscomsData;
  discomsInScope: Discom[];
  indicatorKeys: string[];
  year: string;
}

export default function StandardsTable({ discoms, discomsInScope, indicatorKeys, year }: Props) {
  return (
    <section className="panel blueprint" id="sec-table">
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      <div className="panel-head" style={{ marginBottom: 16 }}>
        <h2>Standard vs. Reported</h2>
        <span className="panel-hint">
          FY {year} · {indicatorKeys.length} of {discoms.canonical_order.length} tracked indicators
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="std-table">
          <thead>
            <tr>
              <th>Indicator</th>
              <th>Group</th>
              <th>SERC Standard</th>
              <th>Reported Median</th>
              <th>Status</th>
              <th>DISCOMs Reporting</th>
            </tr>
          </thead>
          <tbody>
            {indicatorKeys.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: 'var(--muted)', padding: '20px 8px' }}>
                  No indicators match the current filters.
                </td>
              </tr>
            ) : (
              indicatorKeys.map((key) => {
                const meta = discoms.canonical_indicators[key];
                const entries = discomsInScope.map((d) => d.years[year]?.indicators[key]).filter(Boolean) as NonNullable<
                  Discom['years'][string]
                >['indicators'][string][];
                const values = entries.map((e) => e.value).filter((v): v is number => v != null);
                const unit = UNIT_LABEL[meta.unit];
                const bench = representativeBenchmark(entries);
                const benchMeaning = entries.find((e) => e.benchmark_meaning && e.benchmark != null && !Number.isNaN(parseFloat(e.benchmark)));
                let standardText = 'Not specified';
                if (bench != null) {
                  standardText = fmt(bench, 2) + (unit === '%' ? '%' : ' ' + unit) + (benchMeaning ? ` — ${benchMeaning.benchmark_meaning}` : '');
                }
                const med = median(values);
                const medianText = med == null ? '—' : fmt(med, 2) + (unit === '%' ? '%' : ' ' + unit);

                const comparable = entries.filter((e) => e.comparison_possible && e.value != null && e.standard_met !== null);
                let statusNode: React.ReactNode;
                if (bench == null) {
                  statusNode = <span className="status-pill status-none">No standard</span>;
                } else if (comparable.length) {
                  const met = comparable.filter((e) => e.standard_met).length;
                  const ratio = met / comparable.length;
                  if (ratio >= 0.66) statusNode = <span className="status-pill status-met">Mostly met ({met}/{comparable.length})</span>;
                  else if (ratio <= 0.34) statusNode = <span className="status-pill status-missed">Mostly missed ({met}/{comparable.length})</span>;
                  else statusNode = <span className="status-pill status-mixed">Mixed ({met}/{comparable.length})</span>;
                } else {
                  statusNode = <span className="status-pill status-none">Not comparable</span>;
                }

                return (
                  <tr key={key}>
                    <td style={{ fontWeight: 500 }}>{key}</td>
                    <td style={{ color: 'var(--muted)' }}>{meta.group}</td>
                    <td>{standardText}</td>
                    <td>{medianText}</td>
                    <td>{statusNode}</td>
                    <td style={{ color: 'var(--muted)' }}>
                      {values.length} of {discomsInScope.length}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
