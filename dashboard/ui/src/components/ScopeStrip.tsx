interface Props {
  stateOrder: string[];
  discomCount: number;
  fyRange: string;
  commonIndicatorCount: number;
  stateHue: Record<string, string>;
}

/** The evidence base's coverage as one integrated statistics strip (typography + separators),
 * not five KPI cards — followed by a compact numbered grid of the 12 states in scope rather than
 * a map dependency or twelve state cards. All four counts here are computed from the live
 * dataset (discoms2.json), so they can't silently drift from what the rest of the app shows. */
export default function ScopeStrip({ stateOrder, discomCount, fyRange, commonIndicatorCount, stateHue }: Props) {
  return (
    <div>
      <p className="scope-ribbon">
        <b>{stateOrder.length}</b> states <span className="scope-sep">—</span> <b>{discomCount}</b> public DISCOMs <span className="scope-sep">—</span> <b>{fyRange}</b>{' '}
        <span className="scope-sep">—</span> <b>20+</b> parameters tracked
        <span className="scope-ribbon-sub">including {commonIndicatorCount} common indicators tracked identically across all states</span>
      </p>
      <p className="section-note" style={{ maxWidth: 640 }}>
        Spanning India&rsquo;s largest states by population — per the project&rsquo;s 2026 scope study, roughly four in five Indians live across
        these 12 states.
      </p>

      <ol className="scope-state-list">
        {stateOrder.map((s, i) => (
          <li key={s}>
            <span className="scope-state-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="dot" style={{ background: stateHue[s] }} />
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
