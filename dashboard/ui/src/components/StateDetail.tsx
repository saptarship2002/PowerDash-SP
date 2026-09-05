'use client';

import '@/lib/chartSetup';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import { useData } from '@/lib/DataContext';
import { CATEGORICAL, hexToRgba, stateHueMap } from '@/lib/colors';
import { representativeBenchmark, stateHasSopData } from '@/lib/computations';
import { fmt, fyLabel, UNIT_LABEL, UNIT_LABEL_FULL } from '@/lib/format';
import Collapsible from './Collapsible';
import DiscomIndicatorTable from './DiscomIndicatorTable';
import SopSection from './SopSection';
import StateShape from './StateShape';
import YearPicker from './YearPicker';
import type { Discom } from '@/lib/types';

export default function StateDetail({ name }: { name: string }) {
  const { discoms, geojson, stateSpecific, loading, error } = useData();
  const router = useRouter();
  // which DISCOM detail rows are open — lifted out of Collapsible so a scorecard click can force
  // its own row open (and let Collapsible's own scroll-into-view take over) without disturbing
  // rows a user already opened/closed by hand. Multiple can stay open at once.
  const [openSheets, setOpenSheets] = useState<Set<string>>(new Set());

  // One filter bar drives the whole page — DISCOM Scorecards, the trend-chart grid, the
  // per-DISCOM indicator tables below them, and the Standards-of-Performance section — rather
  // than each section owning its own picker. `null` year means "no explicit pick yet"; the
  // actual default is resolved once `discoms` has loaded (see `activeYear` below).
  const [selectedDiscom, setSelectedDiscom] = useState('all');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedIndicator, setSelectedIndicator] = useState('all');

  if (loading) return <p className="detail-placeholder">Loading…</p>;
  if (error || !discoms) return <p className="detail-placeholder">Could not load dashboard data.</p>;

  const activeYear = selectedYear ?? (discoms.years.includes('2023-24') ? '2023-24' : discoms.years[0]);
  const YEARS_ASC = [...discoms.years].reverse();
  const allDs = discoms.discoms.filter((d) => d.state === name);
  const ds = selectedDiscom === 'all' ? allDs : allDs.filter((d) => d.short_name === selectedDiscom);

  // a state can have zero reliability DISCOMs and still have real Standards-of-Performance
  // content to show (its own per-DISCOM sheets, or a regulatory-framework listing) — only bail
  // out entirely when neither dataset has anything for this state.
  if (!allDs.length && !stateHasSopData(stateSpecific, name)) {
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
            India DISCOM Performance Dashboard <span>/</span> <b>{name}</b>
          </div>
        </div>

        <div className="coming-soon-panel">
          <svg className="coming-soon-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
          <h1>Information Coming Soon</h1>
          <p>Data Collation in Progress</p>
        </div>
      </div>
    );
  }

  const color = stateHueMap(discoms.state_order)[name] || '#8B1A1A';
  // DISCOMs within a state are nominal identities with no inherent order — each gets its own
  // fixed-order categorical hue (never a lightness ramp of one hue, which is the right encoding
  // for an *ordered* series, not distinct companies). Indexed against the full (unfiltered) list
  // so a DISCOM's color never shifts depending on what the DISCOM filter narrows it to.
  const allCols = allDs.map((_, i) => CATEGORICAL[i]);
  const cols = ds.map((d) => allCols[allDs.indexOf(d)]);
  const keys = discoms.canonical_order;

  // "Indicator Type" (from Common Indicators.xlsx's own grouping) narrows which indicators
  // "Indicator" can offer, in source order rather than alphabetical.
  const groups = Array.from(new Set(keys.map((k) => discoms.canonical_indicators[k].group)));
  const groupKeys = selectedGroup === 'all' ? keys : keys.filter((k) => discoms.canonical_indicators[k].group === selectedGroup);
  const filterKeys = selectedIndicator === 'all' ? groupKeys : groupKeys.filter((k) => k === selectedIndicator);

  const chartableKeys = filterKeys.filter((key) => ds.some((d) => YEARS_ASC.some((y) => d.years[y]?.indicators[key]?.value != null)));

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
          India DISCOM Performance Dashboard <span>/</span> <b>{name}</b>
        </div>
      </div>

      <header className="state-hero" style={{ ['--hero-color' as string]: color, borderLeftColor: color }}>
        <div>
          <h1>{name}</h1>
          <div className="sub">{allDs.length ? allDs.map((d) => `${d.full_name} (${d.short_name})`).join(' · ') : 'No DISCOMs tracked'}</div>
        </div>
        {geojson && (
          <div className="state-hero-shape">
            <StateShape geojson={geojson} name={name} size={120} color={color} />
          </div>
        )}
      </header>

      {allDs.length > 0 && (
        <div className="filter-bar">
          <div className="filter-field">
            <label>DISCOM</label>
            <select value={selectedDiscom} onChange={(e) => setSelectedDiscom(e.target.value)}>
              <option value="all">All DISCOMs</option>
              {allDs.map((d) => (
                <option key={d.sheet} value={d.short_name}>
                  {d.short_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Indicator Type</label>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedIndicator('all');
              }}
            >
              <option value="all">All Types</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Indicator</label>
            <select value={selectedIndicator} onChange={(e) => setSelectedIndicator(e.target.value)}>
              <option value="all">All Indicators</option>
              {groupKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <section className="panel" id="sec-detail">
        <div className="panel-head">
          <div>
            <div className="panel-hint panel-hint--lead">
              Explore year-wise performance of {name} DISCOMs across indicators of Quality and Reliability of Supply and Quality of Service
            </div>
          </div>
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

        {discoms.years.length > 1 && (
          <div className="year-picker-sticky">
            <YearPicker years={discoms.years} active={activeYear} onChange={setSelectedYear} />
          </div>
        )}

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ds.map((d, i) => (
            <Collapsible
              key={d.sheet}
              label={d.short_name}
              meta={d.full_name}
              color={cols[i]}
              animationDelay={i * 60}
              open={openSheets.has(d.sheet)}
              onOpenChange={(isOpen) =>
                setOpenSheets((prev) => {
                  const next = new Set(prev);
                  if (isOpen) next.add(d.sheet);
                  else next.delete(d.sheet);
                  return next;
                })
              }
            >
              <div style={{ overflowX: 'auto' }}>
                <DiscomIndicatorTable discomsData={discoms} discom={d} year={activeYear} />
              </div>
            </Collapsible>
          ))}
        </div>
      </section>

      {stateSpecific && <SopSection stateSpecific={stateSpecific} stateName={name} activeYear={activeYear} discomFilter={selectedDiscom} />}
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
        {meta.group}
        {hasStandard ? ' · vs SERC standard' : ''}
      </div>
      <div style={{ height: 320 }}>
        <Line
          data={{ labels: yearsAsc.map((y) => fyLabel(y)), datasets }}
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
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(18,23,42,0.07)' },
                ticks: { font: { size: 11.5 } },
                title: { display: true, text: UNIT_LABEL_FULL[meta.unit], font: { size: 11.5, weight: 600 }, color: '#6b7280' },
              },
              x: { grid: { display: false }, ticks: { font: { size: 11.5 } } },
            },
          }}
        />
      </div>
    </div>
  );
}
