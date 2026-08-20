'use client';

import { useMemo } from 'react';
import { GRID_NODES, GRID_CONNECTIONS } from '@/lib/grid';

interface Props {
  centroids: Record<string, [number, number]>;
  size: { width: number; height: number };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** A gentle arc rather than a ruler-straight line between two points — bow proportional to
 * segment length, so short hops stay nearly straight and long cross-country links get a visible
 * curve. Reads as a drawn transmission route, not a wireframe graph edge. */
function arcPath([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const bow = len * 0.08;
  const mx = (x1 + x2) / 2 - (dy / len) * bow;
  const my = (y1 + y2) / 2 + (dx / len) * bow;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

/** A quiet electrical-grid accent over the map: thin muted-gold arcs between a handful of node
 * points, each with a soft halo and a slow traveling light. Entirely decorative — no
 * pointer-events, so it never competes with (or intercepts clicks meant for) the state paths
 * underneath, unlike the 3D scene's node hit-targets, which occasionally caught a click meant
 * for the state below them. */
export default function TransmissionLayer({ centroids, size }: Props) {
  const nodePositions = useMemo(() => {
    const out: Record<string, [number, number]> = {};
    GRID_NODES.forEach((n) => {
      const p = centroids[n.state];
      if (p) out[n.id] = p;
    });
    return out;
  }, [centroids]);

  const links = useMemo(
    () =>
      GRID_CONNECTIONS.map((c) => ({ id: c.id, a: nodePositions[c.from], b: nodePositions[c.to] })).filter(
        (l): l is { id: string; a: [number, number]; b: [number, number] } => !!l.a && !!l.b,
      ),
    [nodePositions],
  );

  const nodes = useMemo(
    () => GRID_NODES.map((n) => ({ id: n.id, p: nodePositions[n.id] })).filter((n): n is { id: string; p: [number, number] } => !!n.p),
    [nodePositions],
  );

  if (!size.width || !size.height) return null;

  return (
    <svg
      className="transmission-layer-2d"
      viewBox={`0 0 ${size.width} ${size.height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {links.map(({ id, a, b }) => {
        const d = arcPath(a, b);
        const duration = 9 + (hashStr(id) % 7);
        return (
          <g key={id}>
            <path d={d} className="grid-line" />
            <circle r="1.4" className="grid-pulse">
              <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={d} rotate="auto" />
            </circle>
          </g>
        );
      })}
      {nodes.map(({ id, p }) => (
        <g key={id} transform={`translate(${p[0]} ${p[1]})`} className="grid-node">
          <circle r="7" className="grid-node-halo" />
          <circle r="1.8" className="grid-node-core" />
        </g>
      ))}
    </svg>
  );
}
