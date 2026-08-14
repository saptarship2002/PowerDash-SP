'use client';

/** Restrained analytical-dashboard lighting: one soft ambient fill, a key light from the
 * upper-left (per spec) that gives the top surface its brightness and lets the extruded sides
 * fall naturally darker, and a faint cool rim light from the opposite side so the far edges
 * don't go completely flat black. No point lights, no bloom — the "glow" on lines/pylons comes
 * from their own emissive materials, not scene lighting. */
export default function GridLighting() {
  return (
    <>
      <ambientLight intensity={0.82} color="#c3d2ee" />
      <directionalLight position={[-4, 7, 3]} intensity={1.4} color="#f3f7ff" />
      <directionalLight position={[4.5, 3, -5]} intensity={0.36} color="#79a5d9" />
      <hemisphereLight args={['#4f74ab', '#0a1120', 0.45] } />
    </>
  );
}
