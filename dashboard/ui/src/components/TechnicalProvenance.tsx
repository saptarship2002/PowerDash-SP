const PIPELINES = [
  { workbook: 'Common Indicators.xlsx', script: 'extraction_common.py', json: 'discoms2.json' },
  { workbook: 'State specific Indicators.xlsx', script: 'extraction_state_specific.py', json: 'state_specific.json' },
  { workbook: 'ACCESSIBILITY.xlsx', script: 'extraction_accessibility.py', json: 'accessibility.json' },
];

/** Technical provenance, kept secondary and compact — a code-like flow at the bottom of the page
 * rather than a bordered card per file, for anyone who wants to trace a number back to its exact
 * source script. */
export default function TechnicalProvenance() {
  return (
    <div className="provenance-flows">
      {PIPELINES.map((p) => (
        <div className="provenance-flow" key={p.workbook}>
          <code>{p.workbook}</code>
          <span aria-hidden="true">→</span>
          <code>{p.script}</code>
          <span aria-hidden="true">→</span>
          <code>{p.json}</code>
        </div>
      ))}
    </div>
  );
}
