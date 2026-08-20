'use client';

import { useData } from '@/lib/DataContext';
import { stateHueMap } from '@/lib/colors';
import AnimatedNumber from './AnimatedNumber';

/** Yes/No/N-A pill for a tri-state accessibility flag — reuses the same status-pill classes the
 * Standards table (formerly the Scorecards Report) already established, so this reads as the
 * same product rather than a bolted-on page. */
function Pill({ status }: { status: boolean | null }) {
  if (status === true) return <span className="status-pill status-met">Yes</span>;
  if (status === false) return <span className="status-pill status-missed">No</span>;
  return <span className="status-pill status-none">N/A</span>;
}

export default function AccessibilityView() {
  const { accessibility, loading, error } = useData();

  if (loading) return <p className="detail-placeholder">Loading dashboard data…</p>;
  if (error || !accessibility) return <p className="detail-placeholder">Could not load dashboard data: {error}</p>;

  const { summary, states, discoms, state_order } = accessibility;
  const stateHue = stateHueMap(state_order);
  const stateByName = Object.fromEntries(states.map((s) => [s.state, s]));

  const pctRegulation = summary.states_total ? Math.round((100 * summary.states_regulation_available) / summary.states_total) : 0;
  const pctPublished = summary.discoms_total ? Math.round((100 * summary.discoms_available_on_serc) / summary.discoms_total) : 0;
  const pctMachine = summary.discoms_total ? Math.round((100 * summary.discoms_machine_readable) / summary.discoms_total) : 0;

  const bars: { label: string; pct: number; fg: string; bg: string }[] = [
    { label: 'Regulation Published Online', pct: pctRegulation, fg: 'var(--good)', bg: 'var(--good-soft)' },
    { label: 'Performance Data Published', pct: pctPublished, fg: 'var(--accent)', bg: 'rgba(59, 95, 224, 0.12)' },
    { label: 'Machine-Readable Format', pct: pctMachine, fg: '#4a3aa7', bg: '#e6e2f7' },
  ];

  return (
    <div>
      <div className="kicker" style={{ marginTop: 0 }}>
        <span className="bar" />
        <span className="label">Accessibility</span>
      </div>
      <div className="panel-head" style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 32, color: 'var(--ink)' }}>Regulatory &amp; Data Transparency</h1>
      </div>
      <p className="section-note" style={{ marginTop: 0, marginBottom: 20, fontSize: 13.5 }}>
        Not what the data says, but whether it can be found at all: whether each state&rsquo;s SERC regulation is published online, and whether each
        licensee&rsquo;s reported performance data is publicly available and in a machine-readable format, rather than locked in a scanned PDF.
      </p>

      <div className="state-hero-stats" style={{ marginBottom: 8 }}>
        {[
          [summary.states_regulation_available, summary.states_total, 'States publishing regulation'],
          [summary.discoms_available_on_serc, summary.discoms_total, 'Licensees publishing data'],
          [summary.discoms_machine_readable, summary.discoms_total, 'Licensees machine-readable'],
        ].map(([v, of, label]) => (
          <div className="stat" key={label as string}>
            <b>
              <AnimatedNumber target={v as number} digits={0} />
              <span style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500 }}> / {of as number}</span>
            </b>
            <span>{label as string}</span>
          </div>
        ))}
      </div>

      <div className="section-header" style={{ marginTop: 32 }}>
        <span className="section-label">Overview</span>
        <span className="section-title">Coverage at a Glance</span>
      </div>
      <section className="panel" id="sec-accessibility-overview">
        <div className="panel-icon-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
            <path d="M3 12l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" />
          </svg>
          <h3>Transparency Coverage</h3>
        </div>
        <p className="panel-hint" style={{ margin: '8px 0 20px' }}>
          Across {summary.states_total} states and {summary.discoms_total} tracked licensees
        </p>
        <div className="avail-bars">
          {bars.map(({ label, pct, fg, bg }) => (
            <div className="avail-row" key={label}>
              <div className="lbl">
                <span>{label}</span>
                <span style={{ color: fg, fontWeight: 600 }}>
                  <AnimatedNumber target={pct} digits={0} />%
                </span>
              </div>
              <div className="track" style={{ background: bg }}>
                <div className="fill" style={{ background: fg, width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-header" style={{ marginTop: 32 }}>
        <span className="section-label">State Regulations</span>
        <span className="section-title">SERC Regulation Availability</span>
      </div>
      <p className="section-note">Whether each state&rsquo;s electricity regulatory commission has published its standards-of-performance regulation online.</p>
      <section className="panel" id="sec-accessibility-states">
        <div style={{ overflowX: 'auto' }}>
          <table className="std-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Regulation Published Online</th>
              </tr>
            </thead>
            <tbody>
              {state_order.map((s) => (
                <tr key={s}>
                  <td style={{ fontWeight: 500 }}>
                    <span className="discom-chip" style={{ padding: 0 }}>
                      <span className="dot" style={{ background: stateHue[s] }} />
                      <span className="name">{s}</span>
                    </span>
                  </td>
                  <td>
                    <Pill status={stateByName[s]?.regulation_available ?? null} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="section-header" style={{ marginTop: 32 }}>
        <span className="section-label">Licensees</span>
        <span className="section-title">Reported Data Accessibility by State</span>
      </div>
      <p className="section-note">
        Every tracked licensee, grouped by state: whether its reported performance data is published on the state SERC&rsquo;s website, and whether
        that publication is in a machine-readable format.
      </p>
      {state_order.map((state) => {
        const group = discoms.filter((d) => d.state === state);
        if (!group.length) return null;
        return (
          <div className="state-group" key={state}>
            <div className="state-group-title">
              <span className="dot" style={{ background: stateHue[state] }} />
              {state}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="std-table">
                <thead>
                  <tr>
                    <th>Licensee</th>
                    <th>Data Published</th>
                    <th>Machine-Readable</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map((d) => (
                    <tr key={d.abbreviation}>
                      <td style={{ fontWeight: 500 }}>
                        {d.abbreviation} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {d.discom}</span>
                      </td>
                      <td>
                        <Pill status={d.available_on_serc} />
                      </td>
                      <td>
                        <Pill status={d.machine_readable} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
