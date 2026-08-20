'use client';

interface Props {
  shortName: string;
  fullName: string;
  color: string;
  animationDelay?: number;
}

export default function ScoreCard({ shortName, fullName, color, animationDelay = 0 }: Props) {
  return (
    <div className="scorecard animate-in" style={{ borderTopColor: color, animationDelay: `${animationDelay}ms` }}>
      <div className="sc-head">
        <span className="sc-name">{shortName}</span>
      </div>
      <div className="sc-full">{fullName}</div>
    </div>
  );
}
