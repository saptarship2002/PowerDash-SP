const STEPS = [
  { n: '01', title: 'Identify Standards', body: 'Review SERC regulations and applicable tariff orders and amendments, if any.' },
  { n: '02', title: 'Collect Reported Data', body: 'Gather performance data from official SERC and DISCOM sources.' },
  { n: '03', title: 'Check Accessibility', body: 'Record whether the data is publicly available and machine-readable.' },
  { n: '04', title: 'Check Comparability', body: 'Assess whether the data can validly be compared across states, DISCOMs, and years.' },
  { n: '05', title: 'Assess Whether Standards Are Met', body: 'Where comparison is valid, evaluate reported performance against the prescribed standard.' },
  { n: '06', title: 'Build Dashboard Views', body: 'Structure the evidence into year-, state-, and DISCOM-level views.' },
];

/** The central visual of the page: a connected six-step research process rather than six ordinary
 * cards. Renders as one continuous line on desktop (wrapping 3+3), collapsing to a vertical
 * numbered journey on mobile — the connectors between steps are the point, not the boxes. */
export default function MethodologyJourney() {
  return (
    <ol className="journey">
      {STEPS.map((s, i) => (
        <li className="journey-step" key={s.n}>
          <div className="journey-marker">{s.n}</div>
          <div className="journey-title">{s.title}</div>
          <p className="journey-body">{s.body}</p>
          {i < STEPS.length - 1 && <span className="journey-connector" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}
