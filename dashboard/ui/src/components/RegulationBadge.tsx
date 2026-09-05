'use client';

import { useState } from 'react';

interface Props {
  text: string | null | undefined;
  label?: string;
}

/** A compact "governed by" pill that expands in place to show the full regulatory citation —
 * keeps a potentially long citation string out of the card's default view (progressive
 * disclosure) without hiding that a regulation exists at all. Renders nothing when there's no
 * citation text, rather than an empty/misleading badge. */
export default function RegulationBadge({ text, label = 'Regulatory citation' }: Props) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <div className="regulation-badge">
      <button type="button" className="regulation-badge-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span aria-hidden="true">📜</span> {label}
        <svg className={`regulation-badge-chevron${open ? ' open' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div className="regulation-badge-text">{text}</div>}
    </div>
  );
}
