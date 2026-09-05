'use client';

import '@/lib/chartSetup';
import { useRouter } from 'next/navigation';
import { Bar } from 'react-chartjs-2';
import { useData } from '@/lib/DataContext';
import { compareColor, comparableIndicators, representativeBenchmark } from '@/lib/computations';
import { fmt, fyLabel, median, UNIT_LABEL } from '@/lib/format';
import StateShape from './StateShape';
import type { Discom, DiscomsData } from '@/lib/types';

interface Props {
  states: string[];
  year?: string;
}

export default function CompareView({ states, year }: Props) {
  const { discoms, geojson, loading, error } = useData();
  const router = useRouter();

  if (loading) return <p className="detail-placeholder">Loading…</p>;
  if (error || !discoms || !geojson) return <p className="detail-placeholder">Could not load dashboard data.</p>;

  const activeYear = year && discoms.years.includes(year) ? year : discoms.years.includes('2023-24') ? '2023-24' : discoms.years[0];

  if (states.length < 2) {
    return (
      <div className="state-page">
        <p className="detail-placeholder">Pick at least 2 states to compare from the map explorer.</p>
        <button type="button" className="back-btn" onClick={() => router.back()}>
          Back to Home
        </button>
      </div>
    );
  }

  const comparableKeys = comparableIndicators(discoms.discoms, discoms.canonical_order, states, activeYear)
    .filter((x) => x.comparable)
    .map((x) => x.key);

  return (
    <div className="state-page">
      <div className="state-topbar">
        <button type="button" className="back-btn" onClick={() => router.back()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>
        <div className="breadcrumb">
          India DISCOM Performance Dashboard <span>/</span> <b>Compare</b>
        </div>
      </div>

      <div className="state-hero">
        <div>
          <span className="panel-hint">{fyLabel(activeYear)}</span>
          <h1>Comparing {states.length} states</h1>
          <div className="compare-shapes">
            {states.map((name) => (
              <div className="compare-shape" key={name}>
                <StateShape geojson={geojson} name={name} color={compareColor(states, name) ?? '#999'} />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-grid">
        {comparableKeys.length === 0 ? (
          <p className="detail-placeholder">No indicator is comparable across all selected states for {fyLabel(activeYear)}: they don&rsquo;t overlap on reported data.</p>
        ) : (
          comparableKeys.map((key, idx) => (
            <CompareChart key={key} discoms={discoms} allDiscoms={discoms.discoms} indicatorKey={key} compareSet={states} year={activeYear} animationDelay={idx * 90} />
          ))
        )}
      </div>
    </div>
  );
}

function CompareChart({
  discoms,
  allDiscoms,
  indicatorKey,
  compareSet,
  year,
  animationDelay,
}: {
  discoms: DiscomsData;
  allDiscoms: Discom[];
  indicatorKey: string;
  compareSet: string[];
  year: string;
  animationDelay: number;
}) {
  const meta = discoms.canonical_indicators[indicatorKey];
  const unit = UNIT_LABEL[meta.unit];
  const unitSuffix = (v: number) => fmt(v, unit === '/yr' ? 2 : 1) + (unit === '%' ? '%' : ' ' + unit);

  const perState = compareSet.map((name) => {
    const ds = allDiscoms.filter((d) => d.state === name);
    const vals = ds.map((d) => d.years[year]?.indicators[indicatorKey]?.value).filter((v): v is number => v != null);
    return { name, value: median(vals) };
  });
  const entries = compareSet.flatMap((name) => allDiscoms.filter((d) => d.state === name).map((d) => d.years[year]?.indicators[indicatorKey]).filter(Boolean)) as NonNullable<
    Discom['years'][string]
  >['indicators'][string][];
  const bench = representativeBenchmark(entries);
  const colors = compareSet.map((name) => compareColor(compareSet, name) ?? '#999');

  return (
    <div className="chart-card animate-in" style={{ animationDelay: `${animationDelay}ms` }}>
      <h4>{indicatorKey}</h4>
      <div className="chart-sub">
        {meta.group} · {unit}
      </div>
      <div style={{ height: 280 }}>
        <Bar
          data={{
            labels: perState.map((p) => p.name),
            datasets: [{ label: indicatorKey, data: perState.map((p) => p.value), backgroundColor: colors, borderRadius: 6, maxBarThickness: 70 }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1c2127',
                padding: 10,
                cornerRadius: 8,
                callbacks: { label: (c) => (c.raw == null ? 'no data' : unitSuffix(c.raw as number)) },
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
                          borderColor: '#a12f2f',
                          borderWidth: 2,
                          borderDash: [7, 5],
                          label: {
                            display: true,
                            content: 'SERC Standard: ' + unitSuffix(bench),
                            position: 'end',
                            backgroundColor: '#a12f2f',
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
              x: { grid: { display: false }, ticks: { font: { size: 12.5 } } },
            },
          }}
        />
      </div>
    </div>
  );
}
