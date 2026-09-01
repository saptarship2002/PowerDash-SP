'use client';

import '@/lib/chartSetup';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import { useData } from '@/lib/DataContext';
import { CATEGORICAL, hexToRgba, stateHueMap } from '@/lib/colors';
import { representativeBenchmark } from '@/lib/computations';
import { fmt, UNIT_LABEL } from '@/lib/format';
import AnimatedNumber from './AnimatedNumber';
import DiscomIndicatorTable from './DiscomIndicatorTable';
import ScoreCard from './ScoreCard';
import type { Discom } from '@/lib/types';

export default function StateDetail({ name }: { name: string }) {
  const { discoms, loading, error } = useData();
  const router = useRouter();

  if (loading) return <p className="detail-placeholder">Loading…</p>;
  if (error || !discoms) return <p className="detail-placeholder">Could not load dashboard data.</p>;

  // no year picker here: the trend charts below already show the full time series at once, and
  // per-DISCOM detail (DiscomIndicatorTable) needs one representative snapshot year rather than
  // a user-selectable one — same default year used across the rest of the dashboard.
  const activeYear = discoms.years.includes('2023-24') ? '2023-24' : discoms.years[0];
  const YEARS_ASC = [...discoms.years].reverse();
  const ds = discoms.discoms.filter((d) => d.state === name);

  if (!ds.length) {
    return (
      <div className="state-page">
        <p className="detail-placeholder">No DISCOMs found for &ldquo;{name}&rdquo;.</p>
        <button type="button" className="back-btn" onClick={() => router.back()}>
          Back to Overview
        </button>
      </div>
    );
  }

  const color = stateHueMap(discoms.state_order)[name] || '#8B1A1A';
  // DISCOMs within a state are nominal identities with no inherent order — each gets its own
  // fixed-order categorical hue (never a lightness ramp of one hue, which is the right encoding
  // for an *ordered* series, not distinct companies). Every state page reuses the same 8 slots
  // from the top since only one state's DISCOMs are ever shown together at once.
  const cols = CATEGORICAL.slice(0, ds.length);
  const keys = discoms.canonical_order;

  const withYear = ds.map((d) => d.years[activeYear]).filter(Boolean) as NonNullable<Discom['years'][string]>[];
  const reportingCount = withYear.filter((y) => y.scoring.data_reported_pct > 0).length;
  const avgReported = withYear.length ? withYear.reduce((s, y) => s + y.scoring.indicators_reported, 0) / withYear.length : null;

  const chartableKeys = keys.filter((key) => ds.some((d) => YEARS_ASC.some((y) => d.years[y]?.indicators[key]?.value != null)));

  return (
    <div className="state-page">
      <div className="state-topbar">
        <button type="button" className="back-btn" onClick={() => router.back()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </button>
        <div className="breadcrumb">
          Dashboard <span>/</span> <b>{name}</b>
        </div>
      </div>

      <header className="state-hero" style={{ ['--hero-color' as string]: color, borderLeftColor: color }}>
        <div>
          <h1>{name}</h1>
          <div className="sub">
            FY {activeYear} · {reportingCount} of {ds.length} DISCOMs reporting
          </div>
        </div>
        <div className="state-hero-stats">
          <div className="stat">
            <b>
              <AnimatedNumber target={ds.length} digits={0} />
            </b>
            <span>DISCOMs</span>
          </div>
          <div className="stat">
            <b>{avgReported == null ? '—' : <AnimatedNumber target={avgReported} digits={1} suffix={` of ${keys.length}`} />}</b>
            <span>Avg. Indicators Reported</span>
          </div>
        </div>
      </header>

      <section className="panel" id="sec-detail">
        <div className="panel-head">
          <div>
            <h2>DISCOM Scorecards</h2>
            <div className="panel-hint">Full scorecards, multi-year trend charts, and per-DISCOM indicator detail for FY {activeYear}</div>
          </div>
        </div>

        <div className="scorecard-grid">
          {ds.map((d, i) => (
            <ScoreCard key={d.sheet} shortName={d.short_name} fullName={d.full_name} color={cols[i]} animationDelay={i * 70} />
          ))}
        </div>

        <div className="chart-grid">
          {chartableKeys.length === 0 ? (
            <p className="detail-placeholder">No indicator in the current filter scope has any reported data for this state.</p>
          ) : (
            chartableKeys.map((key, idx) => (
              <IndicatorTrendChart key={key} discomsData={discoms} indicatorKey={key} ds={ds} cols={cols} yearsAsc={YEARS_ASC} activeYear={activeYear} animationDelay={idx * 90} />
            ))
          )}
        </div>

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ds.map((d, i) => (
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
      </section>
    </div>
  );
}

function IndicatorTrendChart({
  discomsData,
  indicatorKey,
  ds,
  cols,
  yearsAsc,
  activeYear,
  animationDelay,
}: {
  discomsData: import('@/lib/types').DiscomsData;
  indicatorKey: string;
  ds: Discom[];
  cols: string[];
  yearsAsc: string[];
  activeYear: string;
  animationDelay: number;
}) {
  const meta = discomsData.canonical_indicators[indicatorKey];
  const unit = UNIT_LABEL[meta.unit];
  const unitSuffix = (v: number) => fmt(v, unit === '/yr' ? 2 : 1) + (unit === '%' ? '%' : ' ' + unit);
  const entries = ds.map((d) => d.years[activeYear]?.indicators[indicatorKey]).filter(Boolean) as NonNullable<Discom['years'][string]>['indicators'][string][];
  const bench = representativeBenchmark(entries);
  // every indicator renders as a line — trend over time is the job regardless of whether a
  // standard exists. When one does, it's drawn as its own horizontal reference line (below,
  // via the annotation plugin) so each DISCOM's line can be read directly against it: above or
  // below the standard, and by how much, at every point in the series.
  const hasStandard = bench != null;

  // area fill is a wash that reads fine under one line — with several DISCOMs overlapping on
  // the same axes, stacking multiple filled areas just muddies into a solid blob, so only the
  // single-series case gets a fill (and even then at a ~10% wash, never a saturated block)
  const datasets = ds.map((d, i) => ({
    label: d.short_name,
    data: yearsAsc.map((y) => d.years[y]?.indicators[indicatorKey]?.value ?? null),
    borderColor: cols[i],
    borderWidth: 2,
    fill: ds.length === 1,
    spanGaps: false,
    tension: 0.35,
    backgroundColor: hexToRgba(cols[i], 0.1),
    pointRadius: yearsAsc.map((y) => (y === activeYear ? 6 : 4)),
    pointHoverRadius: 8,
    pointBackgroundColor: cols[i],
    pointBorderColor: '#faf8f3',
    pointBorderWidth: 2,
  }));

  return (
    <div className="chart-card animate-in" style={{ animationDelay: `${animationDelay}ms` }}>
      <h4>{indicatorKey}</h4>
      <div className="chart-sub">
        {meta.group} · {unit}
        {hasStandard ? ' · vs SERC standard' : ''}
      </div>
      <div style={{ height: 320 }}>
        <Line
          data={{ labels: yearsAsc.map((y) => 'FY ' + y), datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 900, easing: 'easeOutQuart' },
            interaction: { mode: 'nearest', intersect: false, axis: 'x' },
            plugins: {
              legend: { display: ds.length > 1, position: 'bottom', labels: { boxWidth: 10, usePointStyle: true, padding: 14, font: { size: 11.5 } } },
              tooltip: {
                backgroundColor: '#1c2127',
                padding: 10,
                cornerRadius: 8,
                displayColors: true,
                callbacks: { label: (c) => c.dataset.label + ': ' + (c.raw == null ? 'no data' : unitSuffix(c.raw as number)) },
              },
              annotation:
                bench == null
                  ? { annotations: {} }
                  : {
                      annotations: {
                        standard: {
                          type: 'line',
                          yMin: bench,
                          yMax: bench,
                          borderColor: '#b1441c',
                          borderWidth: 2,
                          borderDash: [7, 5],
                          label: {
                            display: true,
                            content: 'SERC Standard: ' + unitSuffix(bench),
                            position: 'start',
                            backgroundColor: '#b1441c',
                            color: '#fff',
                            font: { size: 10.5, weight: 600 },
                            padding: { x: 6, y: 3 },
                            borderRadius: 4,
                          },
                        },
                      },
                    },
            },
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(18,23,42,0.07)' }, ticks: { font: { size: 11.5 } } },
              x: { grid: { display: false }, ticks: { font: { size: 11.5 } } },
            },
          }}
        />
      </div>
    </div>
  );
}
