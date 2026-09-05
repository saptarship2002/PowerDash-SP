const LANES = [
  {
    title: 'Reliability & Power Quality',
    body: 'Canonical indicators (SAIDI, SAIFI, and the rest) that support consistent comparison across DISCOMs and years.',
    note: 'Uses an existing, approved reliability scoring methodology.',
  },
  {
    title: 'Standards of Performance',
    body: 'State-specific consumer-service indicators, preserved using each state’s own source wording.',
    note: 'Not assigned a composite score.',
  },
  {
    title: 'Regulatory & Data Transparency',
    body: 'Whether regulations and reported utility data are public and machine-readable.',
    note: 'Not assigned a composite score.',
  },
];

/** A three-lane diagram rather than three scorecards — and an explicit statement of which lane
 * has an approved scoring methodology and which deliberately do not, so no dataset here is ever
 * mistaken for having a composite score it doesn't have. */
export default function DatasetLanes() {
  return (
    <div className="lanes">
      <div className="lanes-head">Source Evidence</div>
      <span className="lanes-trunk" aria-hidden="true" />
      <div className="lanes-branches">
        {LANES.map((l) => (
          <div className="lane" key={l.title}>
            <div className="lane-title">{l.title}</div>
            <p className="lane-body">{l.body}</p>
            <p className="lane-note">{l.note}</p>
          </div>
        ))}
      </div>
      <span className="lanes-trunk" aria-hidden="true" />
      <div className="lanes-foot">State Views</div>
    </div>
  );
}
