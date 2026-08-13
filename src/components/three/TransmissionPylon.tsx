'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';

/** Shared across every pylon instance — the steel body never changes color/emissive per
 * instance (hover feedback is carried entirely by the per-instance beacon/glow below), so one
 * material each is enough; no need to clone per tower. */
const STEEL = new THREE.MeshStandardMaterial({ color: '#2c3239', metalness: 0.78, roughness: 0.36 });
const STEEL_DARK = new THREE.MeshStandardMaterial({ color: '#1d2127', metalness: 0.7, roughness: 0.42 });

const TOWER_HEIGHT = 0.85;
const FOOTING_H = 0.03;
const LOWER_H = TOWER_HEIGHT * 0.58;
const UPPER_H = TOWER_HEIGHT * 0.24;
const HEAD_H = TOWER_HEIGHT - LOWER_H - UPPER_H;

/** World-space height (above the pylon's own base) where transmission lines attach — the upper
 * crossarm level, not the tip, matching how real conductors hang below the tower's beacon/head. */
export const LINE_ATTACH_HEIGHT = FOOTING_H + LOWER_H + UPPER_H * 0.7;
export const PYLON_TOTAL_HEIGHT = FOOTING_H + TOWER_HEIGHT;

const lowerGeo = new THREE.CylinderGeometry(0.03, 0.05, LOWER_H, 4);
const upperGeo = new THREE.CylinderGeometry(0.014, 0.03, UPPER_H, 4);
const headGeo = new THREE.CylinderGeometry(0.005, 0.014, HEAD_H, 4);
const footingGeo = new THREE.CylinderGeometry(0.075, 0.09, FOOTING_H, 8);
const beaconGeo = new THREE.SphereGeometry(0.013, 8, 8);
const glowGeo = new THREE.CircleGeometry(0.15, 24);
const armLowerGeo = new THREE.BoxGeometry(0.22, 0.013, 0.013);
const armUpperGeo = new THREE.BoxGeometry(0.15, 0.013, 0.013);
const braceGeo = new THREE.BoxGeometry(0.009, 0.15, 0.009);

export interface TransmissionPylonProps {
  id: string;
  label: string;
  sub?: string;
  position: [number, number, number];
  hovered: boolean;
  onHoverChange: (hovered: boolean, id: string, label: string, sub: string | undefined, position: [number, number, number]) => void;
  onSelect?: (id: string) => void;
}

export default function TransmissionPylon({ id, label, sub, position, hovered, onHoverChange, onSelect }: TransmissionPylonProps) {
  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffcf8a', transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false }),
    []
  );
  const beaconMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ffb347', emissive: '#ffb347', emissiveIntensity: 0.8, roughness: 0.4, metalness: 0.1 }),
    []
  );
  // react-hooks/immutability assumes useMemo's result is never written to, which is right for
  // plain data but not for a Three.js material: R3F's whole model is mutating scene-graph
  // objects in place rather than reallocating them every render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    glowMat.opacity = hovered ? 0.4 : 0.1;
    // eslint-disable-next-line react-hooks/immutability
    beaconMat.emissiveIntensity = hovered ? 1.7 : 0.8;
  }, [glowMat, beaconMat, hovered]);

  function handleOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    onHoverChange(true, id, label, sub, position);
  }
  function handleOut(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    onHoverChange(false, id, label, sub, position);
  }

  return (
    <group position={position} onPointerOver={handleOver} onPointerOut={handleOut} onClick={() => onSelect?.(id)}>
      <mesh geometry={glowGeo} material={glowMat} rotation-x={-Math.PI / 2} position-y={0.002} scale={hovered ? 1.6 : 1} />
      <mesh geometry={footingGeo} material={STEEL_DARK} position-y={FOOTING_H / 2} />
      <mesh geometry={lowerGeo} material={STEEL} position-y={FOOTING_H + LOWER_H / 2} />
      <mesh geometry={upperGeo} material={STEEL} position-y={FOOTING_H + LOWER_H + UPPER_H / 2} />
      <mesh geometry={headGeo} material={STEEL} position-y={FOOTING_H + LOWER_H + UPPER_H + HEAD_H / 2} />
      <mesh geometry={armLowerGeo} material={STEEL} position-y={FOOTING_H + LOWER_H * 0.8} />
      <mesh geometry={armLowerGeo} material={STEEL} position-y={FOOTING_H + LOWER_H * 0.8} rotation-y={Math.PI / 2} />
      <mesh geometry={armUpperGeo} material={STEEL} position-y={FOOTING_H + LOWER_H + UPPER_H * 0.65} />
      <mesh geometry={armUpperGeo} material={STEEL} position-y={FOOTING_H + LOWER_H + UPPER_H * 0.65} rotation-y={Math.PI / 2} />
      <mesh geometry={braceGeo} material={STEEL_DARK} position-y={FOOTING_H + LOWER_H * 0.42} rotation-z={Math.PI / 5.2} />
      <mesh geometry={braceGeo} material={STEEL_DARK} position-y={FOOTING_H + LOWER_H * 0.42} rotation-z={-Math.PI / 5.2} />
      <mesh geometry={beaconGeo} material={beaconMat} position-y={FOOTING_H + TOWER_HEIGHT + 0.008} />
      {/* invisible fat hit-target: the real geometry above is too thin/sparse to reliably catch
          hover/click at normal viewing distance */}
      <mesh
        position-y={PYLON_TOTAL_HEIGHT / 2}
        visible={false}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={() => onSelect?.(id)}
      >
        <cylinderGeometry args={[0.16, 0.22, PYLON_TOTAL_HEIGHT * 1.15, 8]} />
      </mesh>
    </group>
  );
}
