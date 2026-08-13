'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { StateGeometryEntry } from '@/lib/geo3d';

/** Shared by every state's side walls — a fixed darker blue-grey/teal regardless of that
 * state's top-surface color, so the extrusion thickness reads as structural, not data-colored. */
const SIDE_MATERIAL = new THREE.MeshStandardMaterial({ color: '#212e3c', metalness: 0.22, roughness: 0.64 });
const EDGE_MATERIAL = new THREE.LineBasicMaterial({ color: '#0b131f', transparent: true, opacity: 0.5 });

interface Props {
  entry: StateGeometryEntry;
  fillColor: string;
  outlineColor: string | null;
  hovered: boolean;
  dimmed: boolean;
  clickable: boolean;
  onHoverChange: (hovered: boolean, name: string, position: [number, number, number]) => void;
  onSelect: (name: string) => void;
}

/** One state = one extruded solid (top cap gets this state's data-driven color, side walls use
 * the shared structural material above) plus its edge outline. Each state owns its own top
 * material instance so hover/dim/selected tinting never bleeds into any other state's mesh. */
export default function StateMesh({ entry, fillColor, outlineColor, hovered, dimmed, clickable, onHoverChange, onSelect }: Props) {
  const topMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.06 }), []);

  // react-hooks/immutability assumes useMemo's result is never written to, which is right for
  // plain data but not for a Three.js material: R3F's whole model is mutating scene-graph
  // objects in place rather than reallocating them, so a fresh material every render would
  // defeat the memoization instead of respecting it. Effect (not render body) so the mutation
  // is at least an explicit side effect, not inline in render.
  useEffect(() => {
    const color = new THREE.Color(fillColor);
    if (dimmed) color.multiplyScalar(0.6);
    if (hovered) color.multiplyScalar(1.12);
    topMat.color.copy(color);
    topMat.emissive.set(outlineColor ?? '#000000');
    // eslint-disable-next-line react-hooks/immutability
    topMat.emissiveIntensity = outlineColor ? 0.22 : 0;
  }, [topMat, fillColor, outlineColor, hovered, dimmed]);

  function handleOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    onHoverChange(true, entry.name, entry.topCentroid);
  }
  function handleOut(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    onHoverChange(false, entry.name, entry.topCentroid);
  }
  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    if (clickable) onSelect(entry.name);
  }

  return (
    <group>
      <mesh geometry={entry.geometry} material={[topMat, SIDE_MATERIAL]} onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick} />
      <lineSegments geometry={entry.edges} material={EDGE_MATERIAL} raycast={() => null} />
    </group>
  );
}
