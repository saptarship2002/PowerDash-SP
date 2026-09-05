interface Props {
  commonIndicators: string[];
}

const STATE_SPECIFIC_GROUPS = [
  { title: 'Network & Infrastructure Augmentation', examples: 'New substation erection, network expansion, underground cable expansion, HV/EHV augmentation' },
  { title: 'Meter, Restoration & Outage Management', examples: 'Meter faults and complaints, fuse-off calls, line/cable breakdown, scheduled outage' },
  { title: 'Consumer Grievance & Support Services', examples: 'Help desks, shifting of meter/service line, transfer of ownership, change of category' },
  { title: 'Safety & Electrical Accidents', examples: 'Fatal and non-fatal human accidents, fatal and non-fatal animal accidents' },
];

/** A visual taxonomy, not a text list: the small set of indicators canonicalized and tracked
 * identically everywhere (left), against the much larger, source-specific universe every state's
 * own SoP regulation covers (right) — grouped here into four broad illustrative categories from
 * the project's scope study, not an exhaustive or canonicalized set. */
export default function IndicatorUniverse({ commonIndicators }: Props) {
  return (
    <div className="indicator-universe">
      <div className="indicator-universe-side">
        <div className="indicator-universe-heading">Common Across States</div>
        <p className="indicator-universe-note">Mapped into approved canonical categories for consistent trend comparison across every DISCOM and year.</p>
        <div className="indicator-chip-row">
          {commonIndicators.map((k) => (
            <span className="indicator-chip" key={k}>
              {k}
            </span>
          ))}
        </div>
      </div>

      <div className="indicator-universe-divider" aria-hidden="true" />

      <div className="indicator-universe-side">
        <div className="indicator-universe-heading">State-Specific</div>
        <p className="indicator-universe-note">
          Preserved using each state&rsquo;s own source wording, since regulatory definitions vary substantially — never normalized into common names.
          Grouped below into broad illustrative categories, not an exhaustive list.
        </p>
        <div className="indicator-group-list">
          {STATE_SPECIFIC_GROUPS.map((g) => (
            <div className="indicator-group" key={g.title}>
              <div className="indicator-group-title">{g.title}</div>
              <div className="indicator-group-examples">e.g. {g.examples}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
