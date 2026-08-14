/** Transmission network topology for the 3D grid scene — one node per state, dispersed across
 * the whole country as a single national backbone rather than clustered regionally: clustering
 * multiple nodes into two tight corners read as congested/tangled at normal viewing distance.
 * Node positions are NOT hardcoded here — `state` names are resolved against the real state
 * geometry at render time (see geo3d.ts's per-feature centroids), so the towers always sit on
 * the actual state they represent and the whole network can later be repointed at real
 * grid/substation data by simply changing which state (or, eventually, exact lon/lat) each node
 * resolves to. */

export interface GridNode {
  id: string;
  region: 'north' | 'west' | 'south' | 'east' | 'northeast';
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
  { id: 'jk-01', region: 'north', state: 'Jammu & Kashmir' },
  { id: 'punjab-01', region: 'north', state: 'Punjab' },
  { id: 'rajasthan-01', region: 'west', state: 'Rajasthan' },
  { id: 'maharashtra-01', region: 'west', state: 'Maharashtra' },
  { id: 'karnataka-01', region: 'south', state: 'Karnataka' },
  { id: 'tamilnadu-01', region: 'south', state: 'Tamil Nadu' },
  { id: 'westbengal-01', region: 'east', state: 'West Bengal' },
  { id: 'assam-01', region: 'northeast', state: 'Assam' },
];

// a single national backbone (a tree: every node connected, zero crossing lines, zero cycles) —
// a western spine down the coast plus one eastward branch, rather than a dense regional mesh
export const GRID_CONNECTIONS: GridConnection[] = [
  { id: 'jk-01-punjab-01', from: 'jk-01', to: 'punjab-01', status: 'active', flow: 54 },
  { id: 'punjab-01-rajasthan-01', from: 'punjab-01', to: 'rajasthan-01', status: 'active', flow: 63 },
  { id: 'rajasthan-01-maharashtra-01', from: 'rajasthan-01', to: 'maharashtra-01', status: 'active', flow: 68 },
  { id: 'maharashtra-01-karnataka-01', from: 'maharashtra-01', to: 'karnataka-01', status: 'active', flow: 72 },
  { id: 'karnataka-01-tamilnadu-01', from: 'karnataka-01', to: 'tamilnadu-01', status: 'active', flow: 58 },
  { id: 'rajasthan-01-westbengal-01', from: 'rajasthan-01', to: 'westbengal-01', status: 'active', flow: 51 },
  { id: 'westbengal-01-assam-01', from: 'westbengal-01', to: 'assam-01', status: 'active', flow: 47 },
];
