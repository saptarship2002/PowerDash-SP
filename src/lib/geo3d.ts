import { geoMercator, geoPath } from 'd3-geo';
import * as THREE from 'three';
import type { IndiaGeoJSON, GeoFeature } from './types';

/** World-unit footprint of the projected map plane, before centering/rotation. Kept modest —
 * the camera/composition, not a huge geometry, is what should make the map feel "big." */
export const PLANE_WIDTH = 9;
export const PLANE_DEPTH = 10;
/** Vertical extrusion thickness, in the same world units — tall enough that the side walls
 * read clearly from the isometric camera without turning India into a skyscraper. */
export const EXTRUDE_HEIGHT = 0.55;

type Ring = [number, number][];
type PolygonRings = Ring[]; // first = outer, rest = holes

function polygonsForFeature(feature: GeoFeature): PolygonRings[] {
  const geom = feature.geometry as { type: string; coordinates: unknown };
  if (geom.type === 'Polygon') return [geom.coordinates as PolygonRings];
  if (geom.type === 'MultiPolygon') return geom.coordinates as PolygonRings[];
  return [];
}

export interface StateGeometryEntry {
  name: string;
  /** Extruded solid for this state (all polygon parts of a MultiPolygon merged into one). */
  geometry: THREE.ExtrudeGeometry;
  /** Boundary/edge lines derived from the same geometry — outer border + side edges. */
  edges: THREE.EdgesGeometry;
  /** World-space point on the extrusion's TOP surface at this state's projected centroid —
   * where a pylon for this state should stand. */
  topCentroid: [number, number, number];
}

export interface IndiaGeometry {
  entries: StateGeometryEntry[];
  byName: Record<string, StateGeometryEntry>;
  size: { width: number; depth: number };
}

/** Turns the raw India states GeoJSON into per-state extruded 3D solids, laid flat on the
 * XZ plane (Y = up) and centered at the local origin. Geometry is expensive to build (real
 * triangulation per state), so this is meant to be called once per geojson via useMemo, not
 * per render/per hover. */
export function buildIndiaGeometry(geojson: IndiaGeoJSON): IndiaGeometry {
  const margin = 0.35;
  const projection = geoMercator().fitExtent(
    [
      [margin, margin],
      [PLANE_WIDTH - margin, PLANE_DEPTH - margin],
    ],
    geojson as never
  );
  const gp = geoPath(projection);
  const cx = PLANE_WIDTH / 2;
  const cz = PLANE_DEPTH / 2;

  // x is negated: empirically, the raw d3-projected +X (east) rendered on the LEFT of the scene
  // once combined with the isometric camera's own orientation — negating here keeps east on the
  // right/west on the left without having to fight the camera's basis vectors to explain why.
  const project = ([lon, lat]: [number, number]) => {
    const [x, y] = projection([lon, lat]) as [number, number];
    return new THREE.Vector2(-(x - cx), y - cz);
  };

  const entries: StateGeometryEntry[] = geojson.features.map((f) => {
    const shapes = polygonsForFeature(f).map((rings) => {
      const [outer, ...holes] = rings;
      const shape = new THREE.Shape(outer.map(project));
      holes.forEach((hole) => shape.holes.push(new THREE.Path(hole.map(project))));
      return shape;
    });

    const geometry = new THREE.ExtrudeGeometry(shapes, {
      depth: EXTRUDE_HEIGHT,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.022,
      bevelSegments: 2,
      curveSegments: 6,
    });
    // shape lives in XY with depth along +Z; rotating -90 about X puts the footprint flat on
    // XZ (Y up) so +Z (depth) becomes +Y (height) — see geo3d's module comment in grid3d.ts
    // sibling docs for the resulting axis mapping used by topCentroid below.
    geometry.rotateX(-Math.PI / 2);

    const edges = new THREE.EdgesGeometry(geometry, 25);

    const [ccx, ccy] = gp.centroid(f as never) as [number, number];
    // same rotation (and the same x negation as `project` above) applied by hand to a single
    // point: local (x, y, z=EXTRUDE_HEIGHT) on the top cap maps to world (-x, EXTRUDE_HEIGHT, -y)
    const topCentroid: [number, number, number] = [-(ccx - cx), EXTRUDE_HEIGHT, -(ccy - cz)];

    return { name: f.properties.st_nm, geometry, edges, topCentroid };
  });

  const byName: Record<string, StateGeometryEntry> = {};
  entries.forEach((e) => {
    byName[e.name] = e;
  });

  return { entries, byName, size: { width: PLANE_WIDTH, depth: PLANE_DEPTH } };
}
