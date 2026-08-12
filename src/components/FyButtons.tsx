'use client';

interface Props {
  years: string[];
  value: string;
  onChange: (year: string) => void;
  className?: string;
}

export default function FyButtons({ years, value, onChange, className }: Props) {
  return (
    <div className={`fy-buttons${className ? ' ' + className : ''}`}>
      {years.map((y) => (
        <button key={y} type="button" className={y === value ? 'active' : ''} onClick={() => onChange(y)}>
          FY {y}
        </button>
      ))}
    </div>
  );
}
