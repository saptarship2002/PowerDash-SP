'use client';

import { useMemo, useState } from 'react';
import { useData } from '@/lib/DataContext';
import { stateHueMap } from '@/lib/colors';
import { accessibilityByState, accessibilityGaps, sortStatesForComparison } from '@/lib/computations';
import AccessibilityMatrix from './AccessibilityMatrix';
import AccessibilityPipeline from './AccessibilityPipeline';
import RegulationCoverageGrid from './RegulationCoverageGrid';
import StateAccessibilityChart from './StateAccessibilityChart';

/** An editorial statistics row, not a grid of KPI cards — large numbers and typography carry the
 * hierarchy, thin rules separate the three figures instead of borders/shadows around each one. */
function StatStripItem({ count, total, label }: { count: number; total: number; label: string }) {
  const pct = total ? Math.round((100 * count) / total) : 0;
  return (
    <div className="stat-strip-item">
      <div className="stat-strip-frac">
        {count} / {total}
      </div>
      <div className="stat-strip-pct">{pct}%</div>
      <div className="stat-strip-label">{label}</div>
    </div>
  );
}

export default function AccessibilityView() {
  const { accessibility, loading, error } = useData();
  const [stateFilter, setStateFilter] = useState('all');

  const coverage = useMemo(() => (accessibility ? accessibilityByState(accessibility) : []), [accessibility]);
  const sortedCoverage = useMemo(() => sortStatesForComparison(coverage), [coverage]);
  const gaps = useMemo(() => (accessibility ? accessibilityGaps(accessibility) : null), [accessibility]);

  if (loading) return <p className="detail-placeholder">Loading dashboard data…</p>;
  if (error || !accessibility) return <p className="detail-placeholder">Could not load dashboard data: {error}</p>;

  const { summary, states, discoms, state_order } = accessibility;
  const stateHue = stateHueMap(state_order);

  const chartRows = sortedCoverage.map((c) => ({
    state: c.state,
    color: stateHue[c.state],
    discoms: discoms.filter((d) => d.state === c.state),
    coverage: c,
  }));

  const handleSelectState = (state: string | null) => setStateFilter(state ?? 'all');

  return (
    <div>
      <div className="kicker" style={{ marginTop: 0 }}>
        <span className="bar" />
        <span className="label">Accessibility</span>
      </div>
      <h1 style={{ fontSize: 26, color: 'var(--ink)', marginBottom: 4 }}>Regulatory &amp; Data Transparency</h1>
      <p className="section-note" style={{ marginTop: 0, marginBottom: 20, maxWidth: 640 }}>
        Not what the data says, but whether it can be found at all: whether each state&rsquo;s SERC regulation is published online, and whether each
        licensee&rsquo;s reported performance data is publicly available and machine-readable.
      </p>

      <div className="stat-strip">
        <StatStripItem count={summary.states_regulation_available} total={summary.states_total} label="Regulations Online" />
        <StatStripItem count={summary.discoms_available_on_serc} total={summary.discoms_total} label="Data Published" />
        <StatStripItem count={summary.discoms_machine_readable} total={summary.discoms_total} label="Machine-Readable" />
      </div>

      <p className="access-takeaway">
        All {summary.states_total} tracked states publish their SoP regulations online.
        <br />
        But only {summary.discoms_machine_readable} of {summary.discoms_total} tracked licensees make their performance data available in a
        machine-readable format.
      </p>

      <div className="section-header">
        <span className="section-label">Overview</span>
        <span className="section-title">Accessibility Pipeline</span>
        <span className="section-sub">Where licensee data is lost between being tracked, published, and made reusable</span>
      </div>
      {gaps && <AccessibilityPipeline tracked={summary.discoms_total} published={summary.discoms_available_on_serc} machineReadable={summary.discoms_machine_readable} />}

      <div className="section-header">
        <span className="section-label">State Regulations</span>
        <span className="section-title">SERC Regulations Online</span>
        <span className="section-title-figure">
          {summary.states_regulation_available} / {summary.states_total}
        </span>
      </div>
      <RegulationCoverageGrid states={states} stateOrder={state_order} stateHue={stateHue} />

      <div className="section-header">
        <span className="section-label">State Coverage</span>
        <span className="section-title">Publication &amp; Reusability by State</span>
        <span className="section-sub">Each dot is one licensee — sorted by machine-readable share, then publication share. Click a state to filter the matrix below.</span>
      </div>
      <StateAccessibilityChart rows={chartRows} activeState={stateFilter === 'all' ? null : stateFilter} onSelectState={handleSelectState} />

      <div className="section-header">
        <span className="section-label">Licensee Detail</span>
        <span className="section-title">Accessibility Matrix</span>
      </div>
      <AccessibilityMatrix discoms={discoms} stateOrder={state_order} stateHue={stateHue} stateFilter={stateFilter} onStateFilterChange={setStateFilter} />
    </div>
  );
}
