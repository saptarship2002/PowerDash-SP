'use client';

import TransmissionPylon, { LINE_ATTACH_HEIGHT } from './TransmissionPylon';
import TransmissionLine from './TransmissionLine';
import { GRID_NODES, GRID_CONNECTIONS, type GridNode } from '@/lib/grid3d';

const REGION_LABEL: Record<GridNode['region'], string> = {
  north: 'Northern',
  west: 'Western',
  south: 'Southern',
  east: 'Eastern',
  northeast: 'North-eastern',
};

export interface HoverInfo {
  kind: 'pylon' | 'line';
  id: string;
  label: string;
  sub?: string;
  position: [number, number, number];
}

interface Props {
  /** State name -> world point on the map's top surface, from IndiaGeometry. Node positions are
   * resolved from this dynamically (see grid3d.ts) rather than hardcoded, so the network always
   * sits on the real state geometry and can later be repointed at real substation coordinates. */
  topCentroids: Record<string, [number, number, number]>;
  hoveredId: string | null;
  onHover: (info: HoverInfo | null) => void;
}

/** The transmission network as data-driven 3D objects: pylons and lines are both resolved from
 * GRID_NODES/GRID_CONNECTIONS (src/lib/grid3d.ts), not painted onto the map — each is its own
 * independently hoverable/addressable object. */
export default function TransmissionNetwork({ topCentroids, hoveredId, onHover }: Props) {
  const nodePositions: Record<string, [number, number, number]> = {};
  GRID_NODES.forEach((n) => {
    const p = topCentroids[n.state];
    if (p) nodePositions[n.id] = p;
  });

  return (
    <group>
      {GRID_CONNECTIONS.map((c) => {
        const from = nodePositions[c.from];
        const to = nodePositions[c.to];
        if (!from || !to) return null;
        const a: [number, number, number] = [from[0], from[1] + LINE_ATTACH_HEIGHT, from[2]];
        const b: [number, number, number] = [to[0], to[1] + LINE_ATTACH_HEIGHT, to[2]];
        return (
          <TransmissionLine
            key={c.id}
            id={c.id}
            from={a}
            to={b}
            flow={c.flow}
            hovered={hoveredId === c.id}
            onHoverChange={(hovered, id, label, sub, position) => onHover(hovered ? { kind: 'line', id, label, sub, position } : null)}
          />
        );
      })}
      {GRID_NODES.map((n) => {
        const pos = nodePositions[n.id];
        if (!pos) return null;
        return (
          <TransmissionPylon
            key={n.id}
            id={n.id}
            label={n.state}
            sub={`${REGION_LABEL[n.region]} grid node`}
            position={pos}
            hovered={hoveredId === n.id}
            onHoverChange={(hovered, id, label, sub, position) => onHover(hovered ? { kind: 'pylon', id, label, sub, position } : null)}
          />
        );
      })}
    </group>
  );
}
