'use client';

import Collapsible from './Collapsible';
import RegulationBadge from './RegulationBadge';
import SopIndicatorTable from './SopIndicatorTable';
import type { SopFramework } from '@/lib/types';

interface Props {
  framework: SopFramework;
  stateName: string;
}

/** For the 5 states with a notified SoP regulation but no per-DISCOM reported-figures sheet at
 * all (Uttar Pradesh, Tamil Nadu, Karnataka, Andhra Pradesh, West Bengal) — a single summary card
 * in the chart gallery rather than a fake zero-value chart per indicator. Distinct from a DISCOM
 * whose indicators simply have no reported data (Bihar): there is no per-DISCOM sheet here at
 * all, just the regulation's own named indicators/standards/benchmarks. */
export default function FrameworkOnlyCard({ framework, stateName }: Props) {
  return (
    <div className="chart-card visual-card framework-only-card animate-in">
      <div className="visual-card-identity">
        <h4>SoP Framework Available</h4>
        <div className="chart-sub">Standards of Performance · {stateName}</div>
      </div>

      <div className="no-data-box" style={{ marginTop: 14, textAlign: 'left' }}>
        {stateName}&rsquo;s SERC has notified {framework.indicators.length} SoP indicators with standards and benchmarks, but no licensee performance
        figures were available in the source workbook.
        <br />
        ○ No reported time-series figures are available for this state.
      </div>

      <RegulationBadge text={framework.regulation} label="View regulatory framework" />

      <div style={{ marginTop: 14 }}>
        <Collapsible label={stateName} meta={`${framework.indicators.length} notified indicators, no reported data`}>
          <div style={{ overflowX: 'auto' }}>
            <SopIndicatorTable indicators={framework.indicators} showReported={false} />
          </div>
        </Collapsible>
      </div>
    </div>
  );
}
