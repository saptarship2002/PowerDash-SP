'use client';

import StateMultiSelect from './StateMultiSelect';

interface Props {
  allStates: string[];
  stateHue: Record<string, string>;
  compareSet: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onCompare: () => void;
  onClearAll: () => void;
  compareMode: boolean;
  onToggleCompareMode: () => void;
}

/** A dedicated box for building a multi-state comparison — kept separate from the
 * "click one state" Grid Explorer panel so the two workflows (single-state lookup vs.
 * building a comparison set) don't compete for the same space. The map-selection toggle
 * decides what a map click does: off, clicking a state selects just that one (feeds the
 * Grid Explorer panel); on, clicking adds/removes it from this comparison set instead. */
export default function ComparePanel({ allStates, stateHue, compareSet, onAdd, onRemove, onCompare, onClearAll, compareMode, onToggleCompareMode }: Props) {
  const n = compareSet.length;

  return (
    <aside className="control-panel">
      <div className="control-panel-head">
        <span className="control-panel-eyebrow">Analysis</span>
        <h3>Compare States</h3>
      </div>

      <button type="button" className="toggle-row" role="switch" aria-checked={compareMode} onClick={onToggleCompareMode}>
        <span className="toggle-switch" data-on={compareMode}>
          <span className="toggle-thumb" />
        </span>
        <span>Select states on the map</span>
      </button>

      <StateMultiSelect allStates={allStates} stateHue={stateHue} selected={compareSet} onAdd={onAdd} onRemove={onRemove} />

      <p className="control-hint">
        {n === 0 && (compareMode ? 'Click states on the map, or use the dropdown, to compare.' : 'Turn on map selection above, or use the dropdown, to compare.')}
        {n === 1 && 'Select at least one more state to compare.'}
        {n >= 2 && `${n} states selected.`}
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="control-compare-btn" disabled={n < 2} onClick={onCompare}>
          Compare {n >= 2 ? `(${n})` : ''}
        </button>
        <button type="button" className="control-ghost-btn" disabled={n === 0} onClick={onClearAll}>
          Clear
        </button>
      </div>
    </aside>
  );
}
