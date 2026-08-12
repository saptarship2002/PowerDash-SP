'use client';

import { useState } from 'react';
import { useData } from '@/lib/DataContext';
import { stateHueMap } from '@/lib/colors';
import { discomsInScope, indicatorsInScope } from '@/lib/computations';
import AnimatedNumber from './AnimatedNumber';
import AvailabilityPanel from './AvailabilityPanel';
import DiscomIndicatorTable from './DiscomIndicatorTable';
import FiltersBar from './FiltersBar';
import FyButtons from './FyButtons';
import StandardsTable from './StandardsTable';

export default function ReportView() {
  const { discoms, loading, error } = useData();
  const [year, setYear] = useState<string | null>(null);
  const [group, setGroup] = useState('all');
  const [indicator, setIndicator] = useState('all');

  if (loading) return <p className="detail-placeholder">Loading dashboard data…</p>;
  if (error || !discoms) return <p className="detail-placeholder">Could not load dashboard data: {error}</p>;

  const activeYear = year ?? (discoms.years.includes('2023-24') ? '2023-24' : discoms.years[0]);
  const stateHue = stateHueMap(discoms.state_order);
  const indicatorKeys = indicatorsInScope(discoms, group, indicator);
  const allDiscoms = discomsInScope(discoms.discoms, []);

  const withYear = discoms.discoms.filter((d) => d.years[activeYear]);
  const total = discoms.discoms.length;
  const nStates = discoms.state_order.length;
  const noData = withYear.filter((d) => d.years[activeYear]!.scoring.data_reported_pct === 0).length;

  return (
    <div>
      <div className="kicker" style={{ marginTop: 0 }}>
        <span className="bar" />
        <span className="label">Scorecards Report</span>
      </div>
      <div className="panel-head" style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 32, color: 'var(--ink)' }}>Licensees &amp; Reported Data</h1>
        <div className="fy-select">
          <span className="flabel">Financial Year</span>
          <FyButtons years={discoms.years} value={activeYear} onChange={setYear} />
        </div>
      </div>
      <div className="state-hero-stats" style={{ marginBottom: 8 }}>
        {[
          [total, 'Licensees'],
          [nStates, 'States'],
          [noData, 'No data reported'],
        ].map(([v, label]) => (
          <div className="stat" key={label as string}>
            <b>
              <AnimatedNumber target={v as number} digits={0} />
            </b>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="section-header" style={{ marginTop: 32 }}>
        <span className="section-label">Coverage &amp; Standards</span>
        <span className="section-title">Data Availability &amp; Standard vs. Reported</span>
      </div>
      <p className="section-note">
        How much of the tracked indicator set is actually reported, and how reported values compare against each state&rsquo;s own SERC standard —
        across all {total} licensees. Filter to a single indicator group or indicator below.
      </p>
      <FiltersBar discoms={discoms} group={group} indicator={indicator} onGroupChange={setGroup} onIndicatorChange={setIndicator} />
      <AvailabilityPanel discomsInScope={allDiscoms} canonicalOrder={discoms.canonical_order} year={activeYear} compareSet={[]} />
      <StandardsTable discoms={discoms} discomsInScope={allDiscoms} indicatorKeys={indicatorKeys} year={activeYear} />
      <p className="section-note" style={{ marginTop: 8 }}>
        &ldquo;Reported Median&rdquo; is the median of each indicator&rsquo;s normalized value across all licensees for the selected year;
        &ldquo;SERC Standard&rdquo; shows the most common benchmark value/meaning reported by those same sheets (shown as-is, not
        reinterpreted).
      </p>

      <div className="section-header" style={{ marginTop: 32 }}>
        <span className="section-label">Overview</span>
        <span className="section-title">Licensees by State</span>
      </div>
      <p className="section-note">
        Every tracked licensee, grouped by state — click one open for its full reported indicator detail (value, benchmark, and each sheet&rsquo;s
        own remark alongside them) for FY {activeYear}.
      </p>
      {discoms.state_order.map((state) => {
        const group = withYear.filter((d) => d.state === state);
        if (!group.length) return null;
        return (
          <div className="state-group" key={state}>
            <div className="state-group-title">
              <span className="dot" style={{ background: stateHue[state] }} />
              {state}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {group.map((d, i) => (
                <details className="discom-detail animate-in" key={d.sheet} style={{ animationDelay: `${i * 60}ms` }}>
                  <summary>
                    <span>{d.short_name}</span>
                    <span className="reg">{d.full_name}</span>
                  </summary>
                  <div style={{ overflowX: 'auto' }}>
                    <DiscomIndicatorTable discomsData={discoms} discom={d} year={activeYear} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
