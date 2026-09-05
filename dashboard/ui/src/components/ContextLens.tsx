import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}

/** A compact inline metadata lens — "Benchmark · value" — rather than a boxed panel of equal
 * visual weight to the chart. Several sit in one wrapping row above the chart, reading as
 * dashboard metadata rather than a form. */
export default function ContextLens({ label, value, sub }: Props) {
  return (
    <div className="context-lens">
      <span className="context-lens-label">{label}</span>
      <span className="context-lens-sep" aria-hidden="true">
        ·
      </span>
      <span className="context-lens-value">{value}</span>
      {sub && <span className="context-lens-sub">{sub}</span>}
    </div>
  );
}
