'use client';

import AnimatedNumber from './AnimatedNumber';
import { stateHasData } from '@/lib/computations';
import type { Discom } from '@/lib/types';

interface Props {
  discoms: Discom[];
  allStates: string[];
  year: string;
}

export default function StatCards({ discoms, allStates, year }: Props) {
  const reporting = allStates.filter((s) => stateHasData(discoms, s, year)).length;

  return (
    <>
      <div className="stat-card pos-tl">
        <span className="stat-card-label">Grid Status</span>
        <span className="stat-card-status">
          <span className="pulse-dot" />
          Normal
        </span>
      </div>

      <div className="stat-card pos-tl2">
        <span className="stat-card-label">States Reporting</span>
        <span className="stat-card-value">
          <AnimatedNumber target={reporting} digits={0} /> <span className="stat-card-of">/ {allStates.length}</span>
        </span>
      </div>
    </>
  );
}
