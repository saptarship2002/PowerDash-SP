'use client';

import { useEffect, useMemo, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import GridCamera from './three/GridCamera';
import GridLighting from './three/GridLighting';
import IndiaMap3D, { type StateHoverInfo } from './three/IndiaMap3D';
import TransmissionNetwork, { type HoverInfo as NetworkHoverInfo } from './three/TransmissionNetwork';
import { buildIndiaGeometry, type IndiaGeometry } from '@/lib/geo3d';
import type { Discom, IndiaGeoJSON } from '@/lib/types';

interface Props {
  discoms: Discom[];
  geojson: IndiaGeoJSON;
  year: string;
  compareColorOf: (name: string) => string | null;
  onStateClick: (name: string) => void;
  revealedRef: React.RefObject<boolean>;
  onCentroids?: (centroids: Record<string, [number, number]>, size: { width: number; height: number }) => void;
}

interface SceneContentProps extends Props {
  cameraTarget: [number, number, number];
}

/** Reports each state's top-surface centroid in on-screen pixel coordinates (relative to the
 * canvas), recomputed whenever the camera or canvas size changes — the same
 * `onCentroids(centroids, size)` contract the old flat SVG HeroMap exposed, so HeroSection's
 * click-popup positioning keeps working unchanged even though the projection is now a real
 * camera projection instead of a flat d3 projection. */
function ScreenProjector({ geometry, onCentroids }: { geometry: IndiaGeometry; onCentroids?: Props['onCentroids'] }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useEffect(() => {
    if (!onCentroids) return;
    const v = new THREE.Vector3();
    const out: Record<string, [number, number]> = {};
    geometry.entries.forEach((e) => {
      v.set(e.topCentroid[0], e.topCentroid[1], e.topCentroid[2]).project(camera);
      out[e.name] = [(v.x * 0.5 + 0.5) * size.width, (1 - (v.y * 0.5 + 0.5)) * size.height];
    });
    onCentroids(out, { width: size.width, height: size.height });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, camera, size.width, size.height]);

  return null;
}

function SceneContent({ discoms, geojson, year, compareColorOf, onStateClick, revealedRef, onCentroids, cameraTarget }: SceneContentProps) {
  const geometry = useMemo(() => buildIndiaGeometry(geojson), [geojson]);
  const [stateHover, setStateHover] = useState<StateHoverInfo | null>(null);
  const [networkHover, setNetworkHover] = useState<NetworkHoverInfo | null>(null);

  const topCentroids = useMemo(() => {
    const out: Record<string, [number, number, number]> = {};
    geometry.entries.forEach((e) => {
      out[e.name] = e.topCentroid;
    });
    return out;
  }, [geometry]);

  return (
    <>
      <GridCamera target={cameraTarget} />
      <GridLighting />

      <IndiaMap3D
        geometry={geometry}
        discoms={discoms}
        year={year}
        compareColorOf={compareColorOf}
        revealedRef={revealedRef}
        onStateClick={onStateClick}
        onHoverInfo={(info) => {
          setStateHover(info);
          if (info) setNetworkHover(null);
        }}
      />
      <TransmissionNetwork
        topCentroids={topCentroids}
        hoveredId={networkHover?.id ?? null}
        onHover={(info) => {
          setNetworkHover(info);
          if (info) setStateHover(null);
        }}
      />
      <ScreenProjector geometry={geometry} onCentroids={onCentroids} />

      {stateHover && (
        <Html position={stateHover.position} style={{ pointerEvents: 'none' }}>
          <div className="map-tip grid3d-tip">
            {stateHover.name}
            {!stateHover.hasData && ' · no data'}
            {stateHover.comparing && ' ✓ comparing'}
          </div>
        </Html>
      )}
      {networkHover && (
        <Html position={networkHover.position} style={{ pointerEvents: 'none' }}>
          <div className="map-tip grid3d-tip">
            {networkHover.label}
            {networkHover.sub ? <span className="grid3d-tip-sub"> · {networkHover.sub}</span> : null}
          </div>
        </Html>
      )}
    </>
  );
}

/** How far (world units, +X = west per geo3d.ts's axis mapping) to slide the whole camera rig
 * sideways — camera position and look-at target shift by the same amount, so this is a true
 * pan (clears room for the right-docked control panel) rather than a re-aim that would distort
 * the viewing angle. */
const PAN_X = 2.02;
const CAMERA_BASE_POSITION: [number, number, number] = [2.3, 6.7, -7.5];
const CAMERA_TARGET: [number, number, number] = [0, 0.15, 0.25];

/** Real 3D grid visualization: India as an extruded solid, pylons and transmission lines as
 * separate 3D objects standing on it — replaces the old flat-SVG HeroMap/TransmissionLayer pair
 * with the exact same prop contract (discoms/geojson/year/compareColorOf/onStateClick/
 * revealedRef/onCentroids) so nothing in HeroSection's click/hover/popup wiring has to change. */
export default function GridExplorer3D({ discoms, geojson, year, compareColorOf, onStateClick, revealedRef, onCentroids }: Props) {
  const cameraPosition: [number, number, number] = [CAMERA_BASE_POSITION[0] + PAN_X, CAMERA_BASE_POSITION[1], CAMERA_BASE_POSITION[2]];
  const cameraTarget: [number, number, number] = [CAMERA_TARGET[0] + PAN_X, CAMERA_TARGET[1], CAMERA_TARGET[2]];
  return (
    <div id="mapWrap" className="grid3d-wrap">
      <Canvas camera={{ position: cameraPosition, fov: 56, near: 0.1, far: 100 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={['#07111f']} />
        <SceneContent
          discoms={discoms}
          geojson={geojson}
          year={year}
          compareColorOf={compareColorOf}
          onStateClick={onStateClick}
          revealedRef={revealedRef}
          cameraTarget={cameraTarget}
          onCentroids={onCentroids}
        />
      </Canvas>
    </div>
  );
}
