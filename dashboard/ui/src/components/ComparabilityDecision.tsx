/** Comparability isn't just another checkbox — it's the decision point that determines whether a
 * "standard met?" question is even asked. This is the direct visual explanation for why the
 * dashboard shows "Not comparable" instead of inferring compliance across incompatible metrics. */
export default function ComparabilityDecision() {
  return (
    <div className="comparability-tree">
      <div className="comparability-inputs">
        <span>Reported Value</span>
        <span className="comparability-plus" aria-hidden="true">
          +
        </span>
        <span>Regulatory Standard</span>
      </div>
      <span className="comparability-arrow" aria-hidden="true" />
      <div className="comparability-question">Are they defined on the same basis?</div>
      <div className="comparability-branches">
        <div className="comparability-branch comparability-branch--yes">
          <div className="comparability-branch-label">Yes</div>
          <span className="comparability-arrow" aria-hidden="true" />
          <div className="comparability-branch-outcome">Assess whether the standard was met</div>
        </div>
        <div className="comparability-branch comparability-branch--no">
          <div className="comparability-branch-label">No</div>
          <span className="comparability-arrow" aria-hidden="true" />
          <div className="comparability-branch-outcome">Flag why comparison is not valid — shown as &ldquo;Not comparable&rdquo;</div>
        </div>
      </div>
      <p className="comparability-principle">A standard is only assessed when comparison is valid — the dashboard never infers compliance across incompatible metrics.</p>
    </div>
  );
}
