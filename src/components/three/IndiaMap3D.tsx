'use client';

import { useState } from 'react';
import StateMesh from './StateMesh';
import type { IndiaGeometry } from '@/lib/geo3d';
import { stateFillColor, stateHasData, stateIsTracked } from '@/lib/computations';
import type { Discom } from '@/lib/types';

export interface StateHoverInfo {
  name: string;
  position: [number, number, number];
  hasData: boolean;
  comparing: boolean;
}

interface Props {
  geometry: IndiaGeometry;
  discoms: Discom[];
  year: string;
  compareColorOf: (name: string) => string | null;
  revealedRef: React.RefObject<boolean>;
  onStateClick: (name: string) => void;
  onHoverInfo: (info: StateHoverInfo | null) => void;
}

/** India as real extruded 3D solids — one StateMesh per feature — rather than a flat SVG/image.
 * Owns the cross-state "dim everything but the hovered state" behaviour locally since it's the
 * only place that can see every state's hover state at once. */
export default function IndiaMap3D({ geometry, discoms, year, compareColorOf, revealedRef, onStateClick, onHoverInfo }: Props) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  return (
    <group>
      {geometry.entries.map((entry) => {
        const hasData = stateHasData(discoms, entry.name, year);
        const clickable = stateIsTracked(discoms, entry.name);
        const compareHex = compareColorOf(entry.name);
        const hovered = hoveredState === entry.name;
        return (
          <StateMesh
            key={entry.name}
            entry={entry}
            fillColor={stateFillColor(hasData)}
            outlineColor={compareHex}
            hovered={hovered}
            dimmed={hoveredState != null && !hovered}
            clickable={clickable}
            onHoverChange={(isHovered, name, position) => {
              if (!revealedRef.current) return;
              setHoveredState(isHovered ? name : null);
              onHoverInfo(isHovered ? { name, position, hasData, comparing: !!compareHex } : null);
            }}
            onSelect={(name) => {
              if (!revealedRef.current) return;
              onStateClick(name);
            }}
          />
        );
      })}
    </group>
  );
}
