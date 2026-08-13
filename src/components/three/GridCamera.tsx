'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

interface Props {
  /** Mutable, non-React-state scroll fraction (0-1) — read every frame via useFrame rather than
   * passed as a re-rendering prop, since HeroSection's scroll rig already updates ~60x/sec and
   * routing that through React state would re-render the whole scene every frame for nothing. */
  scrollRef: React.RefObject<{ p: number }>;
  from: CameraPose;
  to: CameraPose;
}

// module-level scratch vectors, reused every frame instead of allocated — this runs in the
// render loop, not render body, so there's no hook-immutability concern with mutating them.
const posA = new THREE.Vector3();
const posB = new THREE.Vector3();
const curPos = new THREE.Vector3();
const targetA = new THREE.Vector3();
const targetB = new THREE.Vector3();
const curTarget = new THREE.Vector3();

/** Animates the default camera between two fixed poses (position/look-at target/FOV) driven by
 * the hero section's scroll fraction — the "map turns from a flat 2D-looking chart into a 3D
 * isometric scene on scroll" effect, done with a real camera move rather than any CSS/2D fakery.
 * No orbit controls — the brief calls for a stable analytical camera, not a game camera. */
export default function GridCamera({ scrollRef, from, to }: Props) {
  useFrame(({ camera }) => {
    const t = Math.max(0, Math.min(1, scrollRef.current?.p ?? 0));

    posA.set(...from.position);
    posB.set(...to.position);
    camera.position.copy(curPos.lerpVectors(posA, posB, t));

    targetA.set(...from.target);
    targetB.set(...to.target);
    camera.lookAt(curTarget.lerpVectors(targetA, targetB, t));

    const persp = camera as THREE.PerspectiveCamera;
    const fov = from.fov + (to.fov - from.fov) * t;
    if (Math.abs(persp.fov - fov) > 1e-4) {
      persp.fov = fov;
      persp.updateProjectionMatrix();
    }
  });
  return null;
}
