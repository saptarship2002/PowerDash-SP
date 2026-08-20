'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/lib/DataContext';
import { stateHueMap } from '@/lib/colors';
import { slugify } from '@/lib/slug';
import HeroSection from '@/components/HeroSection';

export default function OverviewPage() {
  const { discoms, geojson, loading, error } = useData();
  const router = useRouter();

  const [compareSet, setCompareSet] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  const stateHue = useMemo(() => (discoms ? stateHueMap(discoms.state_order) : {}), [discoms]);

  if (loading) return <p className="detail-placeholder">Loading dashboard data…</p>;
  if (error || !discoms || !geojson) return <p className="detail-placeholder">Could not load dashboard data: {error}</p>;

  // the map itself no longer has a year selector (every tracked state is shown regardless of
  // which years it reported in — see stateFillColor); this is still the year the Compare page's
  // initial view uses for its own indicator snapshot.
  const activeYear = discoms.years.includes('2023-24') ? '2023-24' : discoms.years[0];

  function removeState(name: string) {
    setCompareSet((prev) => prev.filter((s) => s !== name));
  }
  // only reachable in compare mode — outside it, HeroSection sends a click straight to
  // onViewFullReport instead of here.
  function toggleState(name: string) {
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
        geojson={geojson}
        stateHue={stateHue}
        compareSet={compareSet}
        onToggleState={toggleState}
        onRemove={removeState}
        onViewFullReport={(name) => router.push(`/state/${slugify(name)}`)}
        onCompare={goToCompare}
        onClearAll={() => setCompareSet([])}
        compareMode={compareMode}
        onToggleCompareMode={() => setCompareMode((v) => !v)}
      />
    </div>
  );
}
