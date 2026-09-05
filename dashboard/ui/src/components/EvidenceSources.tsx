interface Props {
  stateCount: number;
}

/** One clean source-to-evidence diagram — never one box per state. The three source types feed a
 * single structured evidence base, reviewed for each tracked state from official regulator/utility
 * websites. */
export default function EvidenceSources({ stateCount }: Props) {
  return (
    <div className="sources-diagram">
      <div className="sources-list">
        <span>SERC Standards of Performance Regulations</span>
        <span>Applicable Tariff Orders</span>
        <span>DISCOM Performance Reports</span>
      </div>
      <span className="sources-arrow" aria-hidden="true" />
      <div className="sources-evidence">Structured Evidence Base</div>
      <p className="sources-note">
        {stateCount} states · reviewed from official SERC and DISCOM websites
      </p>
    </div>
  );
}
