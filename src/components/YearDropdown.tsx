'use client';

interface Props {
  years: string[];
  value: string;
  onChange: (year: string) => void;
}

export default function YearDropdown({ years, value, onChange }: Props) {
  return (
    <label className="control-field">
      <span className="control-label">Financial Year</span>
      <div className="control-select-wrap">
        <select className="control-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {years.map((y) => (
            <option key={y} value={y}>
              FY {y}
            </option>
          ))}
        </select>
        <svg className="control-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
}
