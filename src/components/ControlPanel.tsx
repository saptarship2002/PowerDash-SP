'use client';

import YearDropdown from './YearDropdown';

interface Props {
  years: string[];
  year: string;
  onYearChange: (y: string) => void;
}

export default function ControlPanel({ years, year, onYearChange }: Props) {
  return (
    <aside className="control-panel">
      <div className="control-panel-head">
        <span className="control-panel-eyebrow">Data Controls</span>
        <h3>Grid Explorer</h3>
      </div>

      <YearDropdown years={years} value={year} onChange={onYearChange} />
    </aside>
  );
}
