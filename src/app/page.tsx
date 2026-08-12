'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/lib/DataContext';
import { stateHueMap } from '@/lib/colors';
import HeroSection from '@/components/HeroSection';

export default function OverviewPage() {
  const { discoms, geojson, loading, error } = useData();
  const router = useRouter();

  const [year, setYear] = useState<string | null>(null);
  const [compareSet, setCompareSet] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  const stateHue = useMemo(() => (discoms ? stateHueMap(discoms.state_order) : {}), [discoms]);

  if (loading) return <p className="detail-placeholder">Loading dashboard data…</p>;
  if (error || !discoms || !geojson) return <p className="detail-placeholder">Could not load dashboard data: {error}</p>;

  const activeYear = year ?? (discoms.years.includes('2023-24') ? '2023-24' : discoms.years[0]);

  function addState(name: string) {
    setCompareSet((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }
  function removeState(name: string) {
    setCompareSet((prev) => prev.filter((s) => s !== name));
  }
  function toggleState(name: string) {
    if (!compareMode) {
      setCompareSet((prev) => (prev.length === 1 && prev[0] === name ? [] : [name]));
      return;
    }
    setCompareSet((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));
  }
  function goToCompare() {
    const qs = new URLSearchParams({ states: compareSet.join(','), year: activeYear }).toString();
    router.push(`/compare?${qs}`);
  }

  return (
    <div id="page-overview">
      <HeroSection
        discoms={discoms.discoms}
        allStates={discoms.state_order}
        years={discoms.years}
        year={activeYear}
        onYearChange={setYear}
        geojson={geojson}
        stateHue={stateHue}
        compareSet={compareSet}
        onToggleState={toggleState}
        onAdd={addState}
        onRemove={removeState}
        onViewFullReport={(name) => router.push(`/state/${encodeURIComponent(name)}`)}
        onCompare={goToCompare}
        onClearAll={() => setCompareSet([])}
        compareMode={compareMode}
        onToggleCompareMode={() => setCompareMode((v) => !v)}
      />

      <footer className="foot" id="sec-methodology">
        Generated from <code>data/Common Indicators.xlsx</code> (35 DISCOM sheets across 12 states, FY 2021-22 – FY 2025-26) via{' '}
        <code>extraction_common.py</code> → <code>build_index.py</code>. State boundaries: public India states GeoJSON (ST_NM property),
        simplified to 3-decimal coordinate precision. For indicator-level data availability and standard-vs-reported comparisons, see the{' '}
        <a href="/report">Scorecards Report</a>.
      </footer>
    </div>
  );
}
