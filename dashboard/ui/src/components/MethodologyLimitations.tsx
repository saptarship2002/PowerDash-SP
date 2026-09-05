'use client';

import { useState } from 'react';

interface Limitation {
  title: string;
  statement: string;
  detail: string;
}

/** Framed as dated study findings ("at the time of the study"), not live dashboard claims — these
 * specific counts came from the presentation's August 2026 review and may since have moved in the
 * live dataset, so they're never presented as current totals. */
const LIMITATIONS: Limitation[] = [
  {
    title: 'Availability',
    statement: 'At the time of the study, 6 of 12 states had no performance data publicly available.',
    detail: 'Regulation text and notified standards existed, but no licensee performance figures could be found in the public domain for these states.',
  },
  {
    title: 'Reporting Quality & Volume',
    statement: 'Filings range from enormous to unreadable.',
    detail: "MGVCL's FY24-25 filing runs to 45,570 pages. Telangana's FY23-24 data is an unreadable scanned copy, and its FY24-26 Overall Performance data is not reported at all.",
  },
  {
    title: 'Missing Benchmarks',
    statement: 'At the time of the study, 9 of 12 states had not set reliability standards.',
    detail: 'Gujarat, Maharashtra, and West Bengal lack minimum benchmarks for several indicators altogether — so no standard exists to compare a reported figure against.',
  },
  {
    title: 'Regulatory Responsiveness',
    statement: 'Outreach to every SERC did not receive a formal reply.',
    detail: 'Follow-ups were sent to every SERC; none formally replied over email, and many calls did not resolve the issue either.',
  },
];

function LimitationCell({ item }: { item: Limitation }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="limitation-cell">
      <div className="limitation-title">{item.title}</div>
      <p className="limitation-statement">{item.statement}</p>
      <button type="button" className="lens-more-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? 'Show less' : 'More detail'}
      </button>
      {open && <p className="limitation-detail">{item.detail}</p>}
    </div>
  );
}

/** Four quadrants separated by rules, not four raised/shadowed scorecards — one key statement per
 * limitation with an optional disclosure for the specifics. */
export default function MethodologyLimitations() {
  return (
    <div className="limitations-grid">
      {LIMITATIONS.map((item) => (
        <LimitationCell item={item} key={item.title} />
      ))}
    </div>
  );
}
