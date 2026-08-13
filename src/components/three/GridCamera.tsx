'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

interface Props {
  target?: [number, number, number];
}

/** Points the Canvas's default camera (position/fov set via Canvas's own `camera` prop, so
 * they're one place, not split across two components) at a fixed look-at target. No orbit
 * controls — the brief calls for a stable analytical camera, not a game camera. */
export default function GridCamera({ target = [1.2, 0.15, 0.25] }: Props) {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(target[0], target[1], target[2]);
  }, [camera, target]);
  return null;
}
