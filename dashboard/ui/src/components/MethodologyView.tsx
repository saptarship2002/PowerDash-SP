'use client';

export default function MethodologyView() {
  return (
    <div>
      <div className="kicker" style={{ marginTop: 0 }}>
        <span className="bar" />
        <span className="label">Methodology</span>
      </div>
      <div className="panel-head" style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 32, color: 'var(--ink)' }}>Where This Data Comes From</h1>
      </div>
      <p className="section-note" style={{ marginTop: 0, marginBottom: 20, fontSize: 13.5 }}>
        What&rsquo;s behind the numbers on this dashboard, and where the map&rsquo;s Tracked / Not captured split comes from.
      </p>

      <div className="section-header" style={{ marginTop: 32 }}>
        <span className="section-label">Source</span>
        <span className="section-title">DISCOM Performance Data</span>
      </div>
      <section className="panel" id="sec-methodology-source">
        <div className="panel-icon-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v16H4z" />
            <path d="M4 9h16M9 4v16" />
          </svg>
          <h3>Common Indicators.xlsx</h3>
        </div>
        <p className="panel-hint" style={{ margin: '8px 0 0' }}>
          35 DISCOM sheets across 12 states, FY 2021-22 to FY 2025-26. One sheet per licensee, each listing the standards-of-performance indicators
          its State Electricity Regulatory Commission (SERC) specifies, the benchmark for each, and what the licensee actually reported. Processed
          into this dashboard&rsquo;s data by <code>extraction_common.py</code>.
        </p>
      </section>

      <div className="section-header" style={{ marginTop: 32 }}>
        <span className="section-label">Coverage</span>
        <span className="section-title">Tracked vs. Not Captured</span>
      </div>
      <p className="section-note">
        The map&rsquo;s two-tier coloring reflects ACPET&rsquo;s own tracked scope, not a judgment on any state&rsquo;s performance.
      </p>
      <section className="panel" id="sec-methodology-coverage">
        <p className="panel-hint" style={{ margin: 0 }}>
          <b>Tracked</b> means ACPET has a DISCOM sheet for that state: it&rsquo;s clickable, with a full report, regardless of whether that DISCOM
          has actually reported data for the current indicators. <b>Not captured</b> means the state isn&rsquo;t in this phase&rsquo;s scope at
          all. Within a tracked state&rsquo;s own report, &ldquo;no data reported&rdquo; is a plain fact read straight from the source sheet (it
          says &ldquo;N/A&rdquo;), not a completeness score or a judgment about the DISCOM.
        </p>
      </section>

      <div className="section-header" style={{ marginTop: 32 }}>
        <span className="section-label">Boundaries</span>
        <span className="section-title">Map &amp; Regulation Data</span>
      </div>
      <section className="panel" id="sec-methodology-map">
        <p className="panel-hint" style={{ margin: 0 }}>
          State boundaries come from the public India states GeoJSON (<code>ST_NM</code> property), simplified to 3-decimal coordinate precision.
          Regulation and data-publication status (whether a state&rsquo;s SERC regulation and each licensee&rsquo;s reported data are published
          online, and in a machine-readable format) is generated from <code>ACCESSIBILITY.xlsx</code> via <code>extraction_accessibility.py</code>;
          see the <a href="/accessibility">Accessibility</a> section for the full breakdown.
        </p>
      </section>
    </div>
  );
}
