/** Transmission network topology for the 3D grid scene — two independent regional clusters
 * (north, northeast), not one dense national mesh: a handful of meaningful nodes each, so the
 * network reads as engineered infrastructure rather than a decorative overlay. Node positions
 * are NOT hardcoded here — `state` names are resolved against the real state geometry at render
 * time (see geo3d.ts's per-feature centroids), so the towers always sit on the actual state they
 * represent and the whole network can later be repointed at real grid/substation data by simply
 * changing which state (or, eventually, exact lon/lat) each node resolves to. */

export interface GridNode {
  id: string;
  region: 'north' | 'northeast';
  /** Which state's top-surface centroid this node's 3D position resolves to. */
  state: string;
}

export interface GridConnection {
  id: string;
  from: string;
  to: string;
  status: 'active' | 'idle';
  /** Mock relative flow strength (0-100) — drives pulse speed/brightness until this is wired to
   * real transmission data. */
  flow: number;
}

export const GRID_NODES: GridNode[] = [
  { id: 'himachal-01', region: 'north', state: 'Himachal Pradesh' },
  { id: 'punjab-01', region: 'north', state: 'Punjab' },
  { id: 'haryana-01', region: 'north', state: 'Haryana' },
  { id: 'jk-01', region: 'north', state: 'Jammu & Kashmir' },
  { id: 'rajasthan-01', region: 'north', state: 'Rajasthan' },
  { id: 'assam-01', region: 'northeast', state: 'Assam' },
  { id: 'meghalaya-01', region: 'northeast', state: 'Meghalaya' },
  { id: 'tripura-01', region: 'northeast', state: 'Tripura' },
];

// north cluster is a closed loop (each node has exactly 2 neighbors) rather than a chain or a
// denser mesh — still clearly a connected network, but with zero crossing lines, which reads
// far cleaner than a triangulated mesh at this node spacing
export const GRID_CONNECTIONS: GridConnection[] = [
  { id: 'jk-01-himachal-01', from: 'jk-01', to: 'himachal-01', status: 'active', flow: 54 },
  { id: 'himachal-01-punjab-01', from: 'himachal-01', to: 'punjab-01', status: 'active', flow: 63 },
  { id: 'punjab-01-haryana-01', from: 'punjab-01', to: 'haryana-01', status: 'active', flow: 68 },
  { id: 'haryana-01-rajasthan-01', from: 'haryana-01', to: 'rajasthan-01', status: 'active', flow: 72 },
  { id: 'rajasthan-01-jk-01', from: 'rajasthan-01', to: 'jk-01', status: 'active', flow: 45 },
  { id: 'assam-01-meghalaya-01', from: 'assam-01', to: 'meghalaya-01', status: 'active', flow: 61 },
  { id: 'meghalaya-01-tripura-01', from: 'meghalaya-01', to: 'tripura-01', status: 'active', flow: 47 },
];
