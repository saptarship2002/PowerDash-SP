'use client';

interface Props {
  shortName: string;
  fullName: string;
  color: string;
  animationDelay?: number;
  onClick?: () => void;
}

export default function ScoreCard({ shortName, fullName, color, animationDelay = 0, onClick }: Props) {
  return (
    <button
      type="button"
      className="scorecard animate-in"
      style={{ borderTopColor: color, animationDelay: `${animationDelay}ms` }}
      onClick={onClick}
    >
      <div className="sc-head">
        <span className="sc-name">{shortName}</span>
      </div>
      <div className="sc-full">{fullName}</div>
    </button>
  );
}
