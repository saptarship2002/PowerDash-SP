import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}

/** A small "definition lens" tile — one fact about an indicator (what its benchmark means, how
 * it's measured, what standard governs it) presented as compact dashboard metadata rather than a
 * table cell. Several sit side by side above a chart to carry context that would otherwise need a
 * paragraph or a row of columns. */
export default function ContextLens({ icon, label, value, sub }: Props) {
  return (
    <div className="context-lens">
      <div className="context-lens-head">
        <span className="context-lens-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="context-lens-label">{label}</span>
      </div>
      <div className="context-lens-value">{value}</div>
      {sub && <div className="context-lens-sub">{sub}</div>}
    </div>
  );
}
