import { fmt, fyLabel } from '@/lib/format';

interface Props {
  yearsAsc: string[];
  values: (number | null)[];
}

/** One illustrative "methodology in practice" example, pulled live from discoms2.json rather than
 * hard-coded from the presentation — it happens to closely match the PPT's own example (MSEDCL,
 * Voltage Variation), which demonstrates source fidelity and missing-value handling at once: a
 * genuine reported swing, followed by a year the DISCOM simply stopped reporting — never
 * converted to zero or interpolated. */
export default function MethodologyExample({ yearsAsc, values }: Props) {
  return (
    <div>
      <div className="method-example">
        <div className="method-example-label">MSEDCL, Maharashtra · Voltage Variation (% of complaint resolution within specified time)</div>
        <div className="method-example-trend">
          {values.map((v, i) => (
            <span className="method-example-point" key={yearsAsc[i]}>
              <span className="method-example-fy">{fyLabel(yearsAsc[i])}</span>
              <span className={`method-example-value${v == null ? ' na' : ''}`}>{v == null ? 'N/A' : fmt(v, 0) + '%'}</span>
              {i < values.length - 1 && (
                <span className="method-example-arrow" aria-hidden="true">
                  →
                </span>
              )}
            </span>
          ))}
        </div>
        <p className="method-example-note">The missing final year remains missing — it is not converted into zero or interpolated from the trend around it.</p>
      </div>

      <div className="missing-data-rule">
        <div className="missing-data-rule-row">
          <span>Source says &ldquo;N/A&rdquo;</span>
          <span aria-hidden="true">→</span>
          <span className="missing-data-rule-good">Dashboard shows &ldquo;N/A&rdquo;</span>
        </div>
        <div className="missing-data-rule-row missing-data-rule-row--not">
          <span className="missing-data-rule-strike">Source says &ldquo;N/A&rdquo;</span>
          <span aria-hidden="true">→</span>
          <span className="missing-data-rule-bad">0</span>
        </div>
        <p className="missing-data-rule-note">Unreadable data stays unreadable, missing years are never interpolated, and textual source values are preserved as-is — no synthetic values are ever created.</p>
      </div>
    </div>
  );
}
