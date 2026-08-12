'use client';

import type { DiscomsData } from '@/lib/types';

interface Props {
  discoms: DiscomsData;
  group: string;
  indicator: string;
  onGroupChange: (g: string) => void;
  onIndicatorChange: (i: string) => void;
}

export default function FiltersBar({ discoms, group, indicator, onGroupChange, onIndicatorChange }: Props) {
  const groups = [...new Set(discoms.canonical_order.map((k) => discoms.canonical_indicators[k].group))];

  return (
    <div className="filters">
      <label className="filter">
        <span className="flabel">Indicator Group</span>
        <select
          value={group}
          onChange={(e) => {
            onGroupChange(e.target.value);
            onIndicatorChange('all');
          }}
        >
          <option value="all">All groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>
      <label className="filter">
        <span className="flabel">Indicator</span>
        <select value={indicator} onChange={(e) => onIndicatorChange(e.target.value)}>
          <option value="all">All indicators</option>
          {discoms.canonical_order.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
