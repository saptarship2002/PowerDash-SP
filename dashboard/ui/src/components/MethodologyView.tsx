'use client';

import { useData } from '@/lib/DataContext';
import { stateHueMap } from '@/lib/colors';
import { fyLabel } from '@/lib/format';
import CompilationFlow from './CompilationFlow';
import ComparabilityDecision from './ComparabilityDecision';
import DatasetLanes from './DatasetLanes';
import EvidenceSources from './EvidenceSources';
import IndicatorUniverse from './IndicatorUniverse';
import MethodologyExample from './MethodologyExample';
import MethodologyJourney from './MethodologyJourney';
import MethodologyLimitations from './MethodologyLimitations';
import MethodologyNav from './MethodologyNav';
import MethodologyPrinciples from './MethodologyPrinciples';
import PurposeFlow from './PurposeFlow';
import QualityAssurance from './QualityAssurance';
import ScopeStrip from './ScopeStrip';
import TechnicalProvenance from './TechnicalProvenance';

export default function MethodologyView() {
  const { discoms, loading, error } = useData();

  if (loading) return <p className="detail-placeholder">Loading dashboard data…</p>;
  if (error || !discoms) return <p className="detail-placeholder">Could not load dashboard data: {error}</p>;

  const stateHue = stateHueMap(discoms.state_order);
  const yearsAsc = [...discoms.years].reverse();
  const fyRange = `${fyLabel(yearsAsc[0])}–${fyLabel(yearsAsc[yearsAsc.length - 1])}`;

  const msedcl = discoms.discoms.find((d) => d.sheet === 'MSEDCL,MAHARASHTRA');
  const exampleValues = yearsAsc.map((y) => msedcl?.years[y]?.indicators['VOLTAGE VARIATION']?.value ?? null);

  return (
    <div className="methodology-page">
      <MethodologyNav />

      <div id="m-context">
        <div className="kicker" style={{ marginTop: 0 }}>
          <span className="bar" />
          <span className="label">Methodology</span>
        </div>
        <h1 className="method-hero-title">How the Evidence Base Was Built</h1>
        <p className="section-note" style={{ marginTop: 4, marginBottom: 14, maxWidth: 640 }}>
          From regulatory standards and utility filings to a structured, comparable record of power-quality and service-performance evidence.
        </p>
        <p className="method-context">
          Reliable, good-quality electricity supply is central to consumer welfare, economic productivity, and distribution-sector performance — the
          Electricity (Rights of Consumers) Rules, 2020 recognise reliability of supply and standards of performance as consumer-facing obligations.
        </p>
        <p className="method-context method-context--note">
          This dashboard is not an evaluative or adversarial exercise. It is a transparent, public-interest tool meant to improve reporting,
          visibility, and constructive dialogue between regulators, utilities, and other stakeholders.
        </p>

        <div className="section-header">
          <span className="section-label">Why This Exists</span>
          <span className="section-title">A Common Evidence Base</span>
        </div>
        <PurposeFlow />
      </div>

      <div id="m-scope">
        <div className="section-header">
          <span className="section-label">Coverage</span>
          <span className="section-title">Scope of the Evidence Base</span>
        </div>
        <ScopeStrip stateOrder={discoms.state_order} discomCount={discoms.discoms.length} fyRange={fyRange} commonIndicatorCount={discoms.canonical_order.length} stateHue={stateHue} />
      </div>

      <div id="m-indicators">
        <div className="section-header">
          <span className="section-label">What We Track</span>
          <span className="section-title">Indicator Universe</span>
        </div>
        <IndicatorUniverse commonIndicators={discoms.canonical_order} />
      </div>

      <div id="m-methodology">
        <div className="section-header">
          <span className="section-label">Approach</span>
          <span className="section-title">The Methodology</span>
          <span className="section-sub">From regulatory standards to a comparable performance dashboard — a six-step process</span>
        </div>
        <MethodologyJourney />

        <div className="section-header">
          <span className="section-label">Decision Point</span>
          <span className="section-title">Comparability</span>
        </div>
        <ComparabilityDecision />
      </div>

      <div id="m-sources">
        <div className="section-header">
          <span className="section-label">Evidence Base</span>
          <span className="section-title">Sources &amp; References</span>
        </div>
        <EvidenceSources stateCount={discoms.state_order.length} />

        <div className="section-header">
          <span className="section-label">Process</span>
          <span className="section-title">Data Compilation &amp; Comparison</span>
        </div>
        <CompilationFlow />

        <div className="section-header">
          <span className="section-label">Rigor</span>
          <span className="section-title">Quality Assurance</span>
        </div>
        <QualityAssurance />

        <div className="section-header">
          <span className="section-label">In Practice</span>
          <span className="section-title">Methodology &amp; Missing Data, Illustrated</span>
        </div>
        <MethodologyExample yearsAsc={yearsAsc} values={exampleValues} />
      </div>

      <div id="m-limitations">
        <div className="section-header">
          <span className="section-label">Honest Accounting</span>
          <span className="section-title">Challenges &amp; Limitations</span>
          <span className="section-sub">What the project encountered while compiling this dataset, as of the August 2026 study</span>
        </div>
        <MethodologyLimitations />
      </div>

      <div>
        <div className="section-header">
          <span className="section-label">Map</span>
          <span className="section-title">Coverage Semantics</span>
        </div>
        <p className="section-note" style={{ maxWidth: 700 }}>
          The home map&rsquo;s three-way coloring reflects ACPET&rsquo;s own tracked scope, not a judgment on any state or licensee.
        </p>
        <div className="coverage-semantics">
          <div className="coverage-semantics-item">
            <span className="map-legend-dot map-legend-dot--tracked" aria-hidden="true" />
            <b>Tracked</b> — the state has an actual reported figure in at least one dataset.
          </div>
          <div className="coverage-semantics-item">
            <span className="map-legend-dot map-legend-dot--no-data" aria-hidden="true" />
            <b>Tracked — Data Not Reported</b> — in scope, with a regulatory framework or source record, but no reported figure is available yet.
          </div>
          <div className="coverage-semantics-item">
            <span className="map-legend-dot map-legend-dot--none" aria-hidden="true" />
            <b>Coming Soon</b> — outside this phase&rsquo;s captured scope entirely.
          </div>
        </div>

        <div className="section-header">
          <span className="section-label">Datasets</span>
          <span className="section-title">Three Lanes, One Evidence Base</span>
        </div>
        <DatasetLanes />

        <div className="section-header">
          <span className="section-label">Governing Rules</span>
          <span className="section-title">Methodological Principles</span>
        </div>
        <MethodologyPrinciples />
      </div>

      <div id="m-provenance">
        <div className="section-header">
          <span className="section-label">Technical</span>
          <span className="section-title">Provenance</span>
        </div>
        <TechnicalProvenance />
      </div>
    </div>
  );
}
