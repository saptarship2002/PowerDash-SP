const STAGES = ['Source Workbook', 'Extraction', 'Independent Field Check', 'Structured JSON', 'Dashboard'];
const CHECKED_FIELDS = ['Year', 'Indicator', 'Meaning', 'Standard', 'Benchmark', 'Reported value', 'Comparability', 'Standard met', 'Reason', 'Regulatory citations'];

/** Presented as research quality assurance, not a developer changelog: every extracted record is
 * independently re-checked field-by-field against its source workbook before it reaches the
 * dashboard — row-count matching alone was never treated as sufficient. */
export default function QualityAssurance() {
  return (
    <div className="qa-flow">
      <div className="qa-stages">
        {STAGES.map((s, i) => (
          <div className="qa-stage-wrap" key={s}>
            <div className="qa-stage">{s}</div>
            {i < STAGES.length - 1 && <span className="qa-arrow" aria-hidden="true" />}
          </div>
        ))}
      </div>
      <p className="qa-note">Every field below is independently re-verified against the source workbook, not just row counts:</p>
      <div className="qa-field-row">
        {CHECKED_FIELDS.map((f) => (
          <span className="qa-field-chip" key={f}>
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
