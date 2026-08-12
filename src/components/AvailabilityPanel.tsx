'use client';

import { useEffect, useRef } from 'react';
import AnimatedNumber from './AnimatedNumber';
import type { Discom } from '@/lib/types';

interface Props {
  discomsInScope: Discom[];
  canonicalOrder: string[];
  year: string;
  compareSet: string[];
}

export default function AvailabilityPanel({ discomsInScope, canonicalOrder, year, compareSet }: Props) {
  const barsRef = useRef<HTMLDivElement>(null);

  let reported = 0;
  let total = 0;
  let comparable = 0;
  for (const d of discomsInScope) {
    const y = d.years[year];
    for (const k of canonicalOrder) {
      total++;
      const ind = y?.indicators[k];
      if (ind && ind.value !== null) reported++;
      if (ind && ind.comparison_possible && ind.value !== null) comparable++;
    }
  }
  const pctReported = total ? Math.round((100 * reported) / total) : 0;
  const pctUnavailable = 100 - pctReported;
  const pctComparable = total ? Math.round((100 * comparable) / total) : 0;

  const rows: [string, number, string, string][] = [
    ['Data Reported', pctReported, 'var(--good)', 'var(--good-soft)'],
    ['Data Unavailable', pctUnavailable, 'var(--critical)', 'var(--critical-soft)'],
    ['Comparison Possible', pctComparable, '#4a3aa7', '#e6e2f7'],
  ];

  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.querySelectorAll<HTMLDivElement>('.fill').forEach((node) => {
        node.style.width = (node.dataset.w ?? '0') + '%';
      });
    });
  }, [pctReported, pctUnavailable, pctComparable]);

  return (
    <section className="panel blueprint" id="sec-avail">
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      <div className="panel-icon-row">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <h3>Data Availability</h3>
      </div>
      <p className="panel-hint" style={{ margin: '8px 0 20px' }}>
        {compareSet.length === 0 ? 'Across all tracked state–DISCOM records' : `Across ${discomsInScope.length} DISCOM(s) in ${compareSet.join(', ')}`} · FY{' '}
        {year}
      </p>
      <div className="avail-bars" ref={barsRef}>
        {rows.map(([label, pct, fg, bg]) => (
          <div className="avail-row animate-in" key={label}>
            <div className="lbl">
              <span>{label}</span>
              <span style={{ color: fg, fontWeight: 600 }}>
                <AnimatedNumber target={pct} digits={0} />%
              </span>
            </div>
            <div className="track" style={{ background: bg }}>
              <div className="fill" data-w={pct} style={{ background: fg }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
