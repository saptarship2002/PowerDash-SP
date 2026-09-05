'use client';

import '@/lib/chartSetup';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/lib/DataContext';
import { CATEGORICAL, stateHueMap } from '@/lib/colors';
import { stateHasSopData } from '@/lib/computations';
import { buildSopSeries } from '@/lib/sop';
import { fmt, fyLabel, UNIT_LABEL, UNIT_LABEL_FULL } from '@/lib/format';
import CompleteDataSection from './CompleteDataSection';
import IndicatorVisualCard, { type CardSeries } from './IndicatorVisualCard';
import SopGallery from './SopGallery';
import StateShape from './StateShape';
import YearPicker from './YearPicker';
import type { Discom, DiscomsData } from '@/lib/types';

function firstIndicatorMeaning(ds: Discom[], yearsAsc: string[], key: string): string | null {
  for (const d of ds) {
    for (const y of yearsAsc) {
      const m = d.years[y]?.indicators[key]?.indicator_meaning;
      if (m) return m;
    }
  }
  return null;
}

export default function StateDetail({ name }: { name: string }) {
  const { discoms, geojson, stateSpecific, loading, error } = useData();
  const router = useRouter();

  // One filter bar drives the whole page — the trend-chart gallery (both datasets) and the
  // Complete Data tables at the bottom — rather than each section owning its own picker. `null`
  // year means "no explicit pick yet"; the actual default is resolved once `discoms` has loaded.
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
  // Standards of Performance is a separate, non-canonicalized dataset — once the reliability
  // Indicator Type/Indicator filter narrows to something specific, showing all of SoP alongside
  // it would defeat "show just this indicator and nothing else".
  const showSop = selectedGroup === 'all' && selectedIndicator === 'all';

  // ---- Overview counts — plain counts of source records, never a derived score ----
  const allSopDiscoms = stateSpecific?.discoms.filter((d) => d.state === name) ?? [];
  const framework = stateSpecific?.frameworks.find((f) => f.state === name);
  const discomNameSet = new Set([...allDs.map((d) => d.short_name), ...allSopDiscoms.map((d) => d.short_name)]);
  const sopIndicatorCount = allSopDiscoms.reduce((n, d) => n + buildSopSeries(d, YEARS_ASC).length, 0) + (framework?.indicators.length ?? 0);
  const fyRange = YEARS_ASC.length > 1 ? `${fyLabel(YEARS_ASC[0])}–${fyLabel(YEARS_ASC[YEARS_ASC.length - 1])}` : fyLabel(YEARS_ASC[0]);

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

      <div className="section-header" style={{ marginTop: 4, marginBottom: 4 }}>
        <span className="section-label">State Overview</span>
      </div>
      <div className="stat-row overview-stat-row">
        <div className="report-row" style={{ border: 'none', padding: 0 }}>
          <span className="v">{discomNameSet.size}</span>
          <span className="k"> DISCOM{discomNameSet.size === 1 ? '' : 's'}</span>
        </div>
        <div className="report-row" style={{ border: 'none', padding: 0 }}>
          <span className="v">{keys.length}</span>
          <span className="k"> reliability indicators</span>
        </div>
        <div className="report-row" style={{ border: 'none', padding: 0 }}>
          <span className="v">{sopIndicatorCount}</span>
          <span className="k"> SoP indicators</span>
        </div>
        <div className="report-row" style={{ border: 'none', padding: 0 }}>
          <span className="v">{fyRange}</span>
        </div>
      </div>

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

      {discoms.years.length > 1 && (
        <div className="year-picker-sticky">
          <YearPicker years={discoms.years} active={activeYear} onChange={setSelectedYear} />
        </div>
      )}

      <div className="section-header" style={{ marginTop: 8 }}>
        <span className="section-label">Visual Analysis</span>
        <span className="section-title">Chart Gallery</span>
      </div>

      {allDs.length > 0 && (
        <>
          <div className="chart-group-title">Reliability &amp; Power Quality</div>
          <div className="chart-grid">
            {chartableKeys.length === 0 ? (
              <p className="detail-placeholder">No indicator in the current filter scope has any reported data for this state.</p>
            ) : (
              chartableKeys.map((key, idx) => {
                const meta = discoms.canonical_indicators[key];
                const unit = UNIT_LABEL[meta.unit];
                const unitSuffix = (v: number) => fmt(v, unit === '/yr' ? 2 : 1) + (unit === '%' ? '%' : ' ' + unit);
                const series: CardSeries[] = ds.map((d, i) => ({
                  label: d.short_name,
                  color: cols[i],
                  points: YEARS_ASC.map((y) => {
                    const ind = d.years[y]?.indicators[key];
                    const benchNum = ind?.benchmark != null && !Number.isNaN(parseFloat(ind.benchmark)) ? parseFloat(ind.benchmark) : null;
                    return {
                      year: y,
                      value: ind?.value ?? null,
                      benchmark: benchNum,
                      benchmarkMeaning: ind?.benchmark_meaning ?? null,
                      reportedMeaning: ind?.reported_meaning ?? null,
                      standardSpecified: ind?.standard_specified ?? null,
                      comparisonPossible: ind?.comparison_possible ?? null,
                      standardMet: ind?.standard_met ?? null,
                      reasonNotComparable: ind?.reason_not_comparable ?? null,
                      regulation: d.years[y]?.regulation || null,
                    };
                  }),
                }));
                return (
                  <IndicatorVisualCard
                    key={key}
                    title={key}
                    typeLabel={meta.group}
                    meaning={firstIndicatorMeaning(ds, YEARS_ASC, key)}
                    unitSuffix={unitSuffix}
                    yAxisLabel={UNIT_LABEL_FULL[meta.unit]}
                    yearsAsc={YEARS_ASC}
                    activeYear={activeYear}
                    series={series}
                    animationDelay={idx * 90}
                  />
                );
              })
            )}
          </div>
        </>
      )}

      {/* SoP indicators aren't part of the reliability Indicator Type/Indicator scoping (they're
          a separate, non-canonicalized dataset) — so narrowing to one reliability indicator (e.g.
          SAIDI) hides Standards of Performance entirely rather than showing an unrelated dataset
          alongside a single-indicator view. */}
      {showSop && stateSpecific && <SopGallery stateSpecific={stateSpecific} stateName={name} activeYear={activeYear} discomFilter={selectedDiscom} yearsAsc={YEARS_ASC} />}

      <CompleteDataSection
        discomsData={discoms as DiscomsData}
        ds={ds}
        cols={cols}
        activeYear={activeYear}
        stateSpecific={showSop ? stateSpecific : null}
        stateName={name}
        discomFilter={selectedDiscom}
        indicatorKeys={filterKeys}
      />
    </div>
  );
}
