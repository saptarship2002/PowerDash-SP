const OBJECTIVES = [
  { n: '01', title: 'Assess Compliance', body: 'Check whether DISCOM-reported performance meets SERC-prescribed standards.' },
  { n: '02', title: 'Build Evidence Base', body: 'Create a common, structured record of power quality and reliability data.' },
  { n: '03', title: 'Surface Gaps', body: 'Highlight data reporting gaps and comparability challenges across states.' },
  { n: '04', title: 'Strengthen Dialogue', body: 'Enable informed institutional conversation on improving quality of supply.' },
];

/** "Why this dashboard exists," as one diagram rather than three cards: regulations, tariff
 * filings, and performance data are fragmented today; the dashboard's job is to fold them into
 * one common evidence base. The four project objectives follow as a connected numbered sequence,
 * not four floating cards. */
export default function PurposeFlow() {
  return (
    <div>
      <div className="purpose-diagram">
        <div className="purpose-fragments">
          <span>Regulations</span>
          <span>Tariff Filings</span>
          <span>Performance Data</span>
        </div>
        <div className="purpose-connector" aria-hidden="true" />
        <div className="purpose-evidence">Common Evidence Base</div>
        <div className="purpose-connector" aria-hidden="true" />
        <div className="purpose-outcomes">
          <span>Transparency</span>
          <span>Comparability</span>
          <span>Informed Dialogue</span>
        </div>
      </div>

      <div className="objectives-journey">
        {OBJECTIVES.map((o, i) => (
          <div className="objectives-step" key={o.n}>
            <div className="objectives-marker">{o.n}</div>
            <div className="objectives-body">
              <div className="objectives-title">{o.title}</div>
              <p className="objectives-text">{o.body}</p>
            </div>
            {i < OBJECTIVES.length - 1 && <div className="objectives-arrow" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </div>
  );
}
