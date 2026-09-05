const STAGES = ['Collect', 'Standardise', 'Cross-check', 'Classify', 'Flag Comparability'];

/** How records are prepared after collection — distinct from the broader six-step research
 * methodology above it. A tight connected sequence, with an explicit clarification of what
 * "standardise" does and does not mean across the two datasets that actually differ on this
 * point, plus the project's own completion milestone as a small annotation, not a success card. */
export default function CompilationFlow() {
  return (
    <div>
      <div className="compilation-flow">
        {STAGES.map((s, i) => (
          <div className="compilation-node-wrap" key={s}>
            <div className="compilation-node">{s}</div>
            {i < STAGES.length - 1 && <span className="compilation-arrow" aria-hidden="true" />}
          </div>
        ))}
      </div>

      <p className="compilation-milestone">
        Common-indicator and state-specific data collection and standardisation is complete for all 5 years across all 12 states.
      </p>

      <div className="standardise-split">
        <div className="standardise-item">
          <div className="standardise-title">Common Indicators</div>
          <p className="standardise-body">Mapped into approved canonical indicator categories (SAIDI, SAIFI, and the rest) for consistent trend comparison across every state.</p>
        </div>
        <div className="standardise-item">
          <div className="standardise-title">Standards of Performance</div>
          <p className="standardise-body">Raw indicator names are deliberately preserved using each state&rsquo;s own source wording — regulatory definitions vary too much to normalize.</p>
        </div>
      </div>
    </div>
  );
}
