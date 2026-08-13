'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';

const flowParticleGeo = new THREE.SphereGeometry(0.022, 10, 10);

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export interface TransmissionLineProps {
  id: string;
  from: [number, number, number];
  to: [number, number, number];
  flow: number;
  hovered: boolean;
  onHoverChange: (hovered: boolean, id: string, label: string, sub: string | undefined, position: [number, number, number]) => void;
}

/** A single transmission connection as its own 3D object: a thin emissive tube (the conductor)
 * plus a larger, low-opacity additive tube around it (the glow), both built from the same
 * Catmull-Rom curve — real geometry connecting two pylons, not a line painted on the map.
 * Curve sags gently downward at the midpoint (like a real conductor's catenary) rather than
 * running dead straight or bowing into a decorative arc. */
export default function TransmissionLine({ id, from, to, flow, hovered, onHoverChange }: TransmissionLineProps) {
  const seed = useMemo(() => hashStr(id), [id]);
  const particleRef = useRef<THREE.Mesh>(null);

  const { curve, coreGeo, glowGeo, midpoint } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = a.clone().lerp(b, 0.5);
    mid.y -= 0.07; // gentle catenary sag, not a decorative bow
    const c = new THREE.CatmullRomCurve3([a, mid, b]);
    return {
      curve: c,
      coreGeo: new THREE.TubeGeometry(c, 24, 0.011, 8, false),
      glowGeo: new THREE.TubeGeometry(c, 24, 0.03, 8, false),
      midpoint: mid,
    };
  }, [from, to]);

  const intensity = 0.55 + (flow / 100) * 0.55;
  const coreMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#f3ad3d', emissive: '#f3ad3d', emissiveIntensity: intensity, roughness: 0.35, metalness: 0.05 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffd68a', transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false }),
    []
  );
  // react-hooks/immutability assumes useMemo's result is never written to, which is right for
  // plain data but not for a Three.js material: R3F's whole model is mutating scene-graph
  // objects in place rather than reallocating them every render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    coreMat.emissiveIntensity = hovered ? intensity * 1.8 : intensity;
    // eslint-disable-next-line react-hooks/immutability
    glowMat.opacity = hovered ? 0.32 : 0.1;
  }, [coreMat, glowMat, hovered, intensity]);

  const particleMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffe3a8', transparent: true, opacity: 0.9 }),
    []
  );

  // slow, elegant, non-synchronized: duration/phase derived from the connection id so pulses
  // don't march in lockstep across the network
  const duration = 7 + (seed % 5); // 7-11s per traversal
  const phase = (seed % 97) / 97;

  useFrame(({ clock }) => {
    if (!particleRef.current) return;
    const t = (phase + clock.elapsedTime / duration) % 1;
    curve.getPointAt(t, particleRef.current.position);
  });

  function handleOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    onHoverChange(true, id, `${flow}% flow`, undefined, [midpoint.x, midpoint.y, midpoint.z]);
  }
  function handleOut(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    onHoverChange(false, id, `${flow}% flow`, undefined, [midpoint.x, midpoint.y, midpoint.z]);
  }

  return (
    <group>
      <mesh geometry={coreGeo} material={coreMat} onPointerOver={handleOver} onPointerOut={handleOut} />
      <mesh geometry={glowGeo} material={glowMat} raycast={() => null} />
      <mesh ref={particleRef} geometry={flowParticleGeo} material={particleMat} raycast={() => null} />
    </group>
  );
}
