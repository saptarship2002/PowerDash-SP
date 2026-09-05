import { fyLabel } from '@/lib/format';
import { complianceStatus } from './ComplianceRail';

interface Props {
  year: string;
  seriesLabel?: string;
  color?: string;
  reportedText: string;
  reportedSub?: string | null;
  benchmarkText?: string | null;
  benchmarkSub?: string | null;
  comparisonPossible: boolean | null;
  standardMet: boolean | null;
  reasonNotComparable?: string | null;
}

/** One fiscal-year/DISCOM observation as a small evidence card: reported value -> benchmark ->
 * comparable? -> standard met?, read top to bottom as a chain rather than a spreadsheet row. Renders
 * even when every field is null (Bihar's case) — a missing observation is still a card, just one
 * that says so, never simply omitted. */
export default function ObservationEvidenceCard({
  year,
  seriesLabel,
  color,
  reportedText,
  reportedSub,
  benchmarkText,
  benchmarkSub,
  comparisonPossible,
  standardMet,
  reasonNotComparable,
}: Props) {
  const status = complianceStatus(comparisonPossible, standardMet);
  const statusText = status === 'met' ? '✓ Standard met' : status === 'not-met' ? '✕ Standard not met' : status === 'not-comparable' ? '! Not comparable' : '– N/A';
  const statusCls = status === 'met' ? 'evidence-status-met' : status === 'not-met' ? 'evidence-status-not-met' : status === 'not-comparable' ? 'evidence-status-not-comparable' : 'evidence-status-na';

  return (
    <div className="evidence-card">
      <div className="evidence-card-head">
        <span className="evidence-card-fy">{fyLabel(year)}</span>
        {seriesLabel && (
          <span className="evidence-card-series" style={color ? { color } : undefined}>
            {seriesLabel}
          </span>
        )}
      </div>

      <div className="evidence-card-row">
        <div className="evidence-card-k">Reported</div>
        <div className="evidence-card-v">{reportedText}</div>
        {reportedSub && <div className="evidence-card-sub">{reportedSub}</div>}
      </div>

      <div className="evidence-card-arrow" aria-hidden="true">
        ↓
      </div>

      <div className="evidence-card-row">
        <div className="evidence-card-k">Benchmark</div>
        <div className="evidence-card-v">{benchmarkText || 'N/A'}</div>
        {benchmarkSub && <div className="evidence-card-sub">{benchmarkSub}</div>}
      </div>

      <div className="evidence-card-arrow" aria-hidden="true">
        ↓
      </div>

      <div className={`evidence-card-status ${statusCls}`}>{statusText}</div>

      {status === 'not-comparable' && reasonNotComparable && reasonNotComparable !== 'N/A' && <div className="evidence-card-reason">{reasonNotComparable}</div>}
    </div>
  );
}
