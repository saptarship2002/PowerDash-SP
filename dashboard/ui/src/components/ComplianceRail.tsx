import { fyLabel } from '@/lib/format';

export type ComplianceStatus = 'met' | 'not-met' | 'not-comparable' | 'na';

/** Raw fields -> a compliance-rail status, never inferring anything the source didn't already
 * say: 'not-comparable' only when the sheet itself marked comparison impossible, 'met'/'not-met'
 * only when the sheet itself marked the standard met/missed, 'na' whenever neither is present. */
export function complianceStatus(comparisonPossible: boolean | null | undefined, standardMet: boolean | null | undefined): ComplianceStatus {
  if (comparisonPossible === false) return 'not-comparable';
  if (standardMet === true) return 'met';
  if (standardMet === false) return 'not-met';
  return 'na';
}

const META: Record<ComplianceStatus, { icon: string; text: string; cls: string }> = {
  met: { icon: '✓', text: 'Met', cls: 'rail-met' },
  'not-met': { icon: '✕', text: 'Not met', cls: 'rail-not-met' },
  'not-comparable': { icon: '!', text: 'Not comparable', cls: 'rail-not-comparable' },
  na: { icon: '–', text: 'N/A', cls: 'rail-na' },
};

interface Props {
  yearsAsc: string[];
  statuses: ComplianceStatus[];
  label?: string;
  color?: string;
}

/** A compact per-year scan line: one chip per fiscal year showing whether the standard was met —
 * always icon + text together, never color alone, so the signal survives grayscale/zoom. */
export default function ComplianceRail({ yearsAsc, statuses, label, color }: Props) {
  return (
    <div className="compliance-rail">
      {label && (
        <span className="compliance-rail-label" style={color ? { color } : undefined}>
          {label}
        </span>
      )}
      <div className="compliance-rail-chips">
        {yearsAsc.map((year, i) => {
          const s = META[statuses[i] ?? 'na'];
          return (
            <span key={year} className={`compliance-chip ${s.cls}`} title={`${fyLabel(year)}: ${s.text}`}>
              <span className="compliance-chip-icon" aria-hidden="true">
                {s.icon}
              </span>
              <span className="compliance-chip-year">{fyLabel(year)}</span>
              <span className="compliance-chip-text">{s.text}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
