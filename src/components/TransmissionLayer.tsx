'use client';

import { GRID_CONNECTIONS } from '@/lib/gridConnections';

interface Props {
  centroids: Record<string, [number, number]>;
  size: { width: number; height: number };
}

function straightPath([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

/** Minimal line-drawn pylon glyph — thin translucent strokes rather than a solid silhouette,
 * so it reads as a delicate technical annotation on the map instead of a bold icon competing
 * with the state fills. */
function PylonIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(0.85)`} className="pylon-icon">
      <path className="pylon-leg" d="M -6,10 L -2,-4 L 0,-14 L 2,-4 L 6,10" />
      <line className="pylon-bar" x1="-3" y1="-4" x2="3" y2="-4" />
      <line className="pylon-bar" x1="-4.3" y1="4" x2="4.3" y2="4" />
      <circle className="pylon-light" r="1.1" cy="-15" />
    </g>
  );
}

/** A single light traveling from `pa` toward `pb` along a straight segment — a plain CSS
 * transform animation (`--dx`/`--dy` carry it from `pa` to `pb`), not SMIL, so it's simple
 * to reason about and needs no per-frame JS. */
function FlowPulse({ pa, pb, delay }: { pa: [number, number]; pb: [number, number]; delay: number }) {
  const style = {
    '--dx': `${pb[0] - pa[0]}px`,
    '--dy': `${pb[1] - pa[1]}px`,
    animationDelay: `${delay}s`,
  } as React.CSSProperties;
  return (
    <g transform={`translate(${pa[0]} ${pa[1]})`}>
      <circle r="2.1" className="flow-pulse" style={style} />
    </g>
  );
}

/** A single connected transmission network (see gridConnections.ts) — thin dotted lines with
 * one slow light pulse traveling each segment, pylons only at the network's own nodes. This
 * is supporting texture for the map, not a focal element: no glow, no dense mesh, no
 * per-state icons — if the pylons are more noticeable than the choropleth, it's overdone. */
export default function TransmissionLayer({ centroids, size }: Props) {
  if (!size.width || !size.height) return null;

  const links = GRID_CONNECTIONS.map(([a, b]) => ({ a, b, pa: centroids[a], pb: centroids[b] })).filter((l) => l.pa && l.pb);
  const nodeNames = Array.from(new Set(links.flatMap((l) => [l.a, l.b])));

  return (
    <svg className="transmission-layer" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {links.map(({ a, b, pa, pb }, i) => (
        <g key={`${a}-${b}`}>
          <path d={straightPath(pa, pb)} className="flow-line-base" />
          <FlowPulse pa={pa} pb={pb} delay={i * 0.6} />
        </g>
      ))}
      {nodeNames.map((name) => {
        const p = centroids[name];
        return p ? <PylonIcon key={name} x={p[0]} y={p[1]} /> : null;
      })}
    </svg>
  );
}
