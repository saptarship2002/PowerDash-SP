# 3D grid map — working context

## History

1. **Original ask**: turn the flat 2D SVG hero map into something that feels 3D on scroll,
   pylons standing upright, states still hoverable/selectable. Built as a CSS 3D transform
   (`rotateX` on the map plane + counter-rotating pylon billboards) on branch
   `feature/3d-hero-map`. Kept the existing flat SVG/d3-geo map, just tilted it in CSS.
2. **This branch (`feature/webgl-grid-3d`)**: a much more ambitious, explicit spec — a real,
   code-level 3D/isometric extruded India map (actual geometry with thickness, not a flattened
   SVG), real 3D pylon objects (steel lattice towers), real 3D transmission lines (tube geometry
   with emissive glow + animated flow particles), proper camera/lighting, all built with
   react-three-fiber. Explicitly: *"Do not use CSS transforms to fake the 3D extrusion... do not
   use a flat SVG with drop shadows as a substitute for 3D."* This supersedes the CSS-tilt
   approach entirely — `HeroMap.tsx`/`TransmissionLayer.tsx` (the old flat-SVG map + pylon icons)
   are deleted on this branch, replaced by `GridExplorer3D.tsx` and `src/components/three/*`.

## Rollback (single command per target)

Three states exist as separate branches/commits — pick whichever you want to return to:

- **Original flat 2D map** (no 3D at all): `git checkout master` — baseline commit `ab80877`.
- **CSS-tilt 3D map** (flat SVG map that tilts via `rotateX` on scroll, pylons as CSS
  counter-rotating billboards): `git checkout feature/3d-hero-map` — commit `9c86754`.
- **Real WebGL 3D map** (this branch, react-three-fiber, extruded geometry): stay on
  `feature/webgl-grid-3d`.

To abandon whatever's currently checked out and go back to the plain 2D map from *any* of these
branches: `git checkout master`.

## Decision: react-three-fiber / Three.js, not CSS

Already justified in the original ask (see History above) — the spec explicitly required actual
3D geometry (extrusion, real pylon/line objects, a real camera), which CSS transforms on flat
SVG cannot produce. Added dependencies: `three`, `@react-three/fiber`, `@react-three/drei`,
`@types/three`.

## Architecture

```
GridExplorer3D.tsx                  — <Canvas> + tooltip (drei <Html>) + screen-projection glue
 ├── three/GridCamera.tsx           — points the default camera at a fixed look-at target (no orbit)
 ├── three/GridLighting.tsx         — ambient + key (upper-left) + rim lights, no bloom/point lights
 ├── three/IndiaMap3D.tsx           — one <StateMesh> per state feature, owns hover/dim state
 │    └── three/StateMesh.tsx       — extruded solid (top cap = data color, sides = shared
 │                                     structural material) + edge outline
 ├── three/TransmissionNetwork.tsx  — resolves GRID_NODES/GRID_CONNECTIONS (src/lib/grid3d.ts)
 │    │                               against real state centroids, renders pylons + lines
 │    ├── three/TransmissionPylon.tsx — procedural steel lattice tower (real 3D geometry)
 │    └── three/TransmissionLine.tsx  — CatmullRom curve → core tube + glow tube + flow particle
lib/geo3d.ts                        — GeoJSON → per-state THREE.ExtrudeGeometry + edges + centroid
lib/grid3d.ts                       — grid node/connection DATA (state name, region, flow, status)
```

`GridExplorer3D` keeps the **exact same prop contract** the old `HeroMap` had (`discoms`,
`geojson`, `year`, `compareColorOf`, `onStateClick`, `revealedRef`, `onCentroids`) — so
`HeroSection.tsx`'s scroll rig, click-popup positioning (`handleStateClick`), and everything else
in the dashboard (compare mode, `StatePopup`, sidebar) needed **zero changes**. `onCentroids` now
reports real camera-projected screen coordinates (via a small `ScreenProjector` component using
`useThree()` + `Vector3.project()`) instead of a flat d3 projection — this is actually *more*
correct than the old flat map for popup positioning, not a regression.

### Axis mapping (geo3d.ts)

The projected map is centered at the local origin, then rotated so `+Z` (extrusion depth)
becomes world `+Y` (up). After that: **world `+Z` = north, world `+X` = west** (x is negated
during projection — see the comment in `geo3d.ts`; this was found empirically, not derived, by
color-marking Jammu & Kashmir/Kerala/Assam and checking where they actually rendered). Pylon/line
positions come from `topCentroid` on each state's `StateGeometryEntry`, resolved dynamically from
real geometry — nothing is hardcoded in screen space.

### Grid network data (grid3d.ts)

Two independent regional clusters, not a national mesh — matches the brief's "2-4 pylons north,
2-3 northeast, not randomly scattered": North = Himachal Pradesh, Haryana, Jammu & Kashmir,
Rajasthan (4 nodes); Northeast = Assam, Meghalaya, Tripura (3 nodes). `GRID_CONNECTIONS` carries
mock `flow`/`status` fields already shaped for real grid data later.

## Bugs found and fixed during verification (all caught by actually screenshotting the running
app, not by reading the code)

1. **East/West mirrored.** Initial render was recognizably India-shaped but rotated wrong —
   confirmed by temporarily forcing Jammu & Kashmir/Kerala/Assam to distinct debug colors and
   checking where they actually landed. Assam (east) was rendering left of J&K (northwest) —
   backwards. Fixed by negating X in `geo3d.ts`'s `project()` and `topCentroid` calculation.
2. **Panning via look-at target only, not a real pan.** Tried to shift the composition left (to
   clear the right-docked control panel) by moving only the camera's `lookAt` target. This
   re-aims the camera (changes viewing angle) rather than translating the view, and produced
   inconsistent, hard-to-predict shifts. Fixed by panning camera position and target together by
   the same delta (`PAN_X` in `GridExplorer3D.tsx`) — a true translation.
3. **Pylon hit-target too thin to reliably hover/click.** The invisible hit-cylinder around each
   pylon (radius ~0.09-0.13 world units) was too small at the final camera distance/FOV — testing
   hover kept landing on the state mesh underneath instead. Widened to 0.16-0.22. This matters
   for real users too, not just automated testing, at this zoom level.
4. **ESLint `react-hooks/immutability` / `react-hooks/refs`.** Mutating a `useMemo`'d Three.js
   material's properties on hover (the standard R3F pattern — mutate scene-graph objects in
   place rather than reallocate) trips the newer React-Compiler-oriented lint rules bundled with
   Next 16. Tried moving the mutation into `useEffect` (still flagged) and switching to
   lazily-initialized `useRef` (flagged by a *different* rule, "no ref access during render").
   Settled on: keep the idiomatic `useMemo` + mutate-in-`useEffect` pattern (correct for R3F) and
   suppress the specific `react-hooks/immutability` lines with a comment explaining that Three.js
   materials are an intentional mutable-imperative boundary the compiler's purity model doesn't
   apply to. This is the standard resolution for this known R3F/React-Compiler tension.

## Composition tuning (GridExplorer3D.tsx)

Final camera: `position: [PAN_X + 2.3, 6.7, -7.5]`, `fov: 56`, look-at target
`[PAN_X, 0.15, 0.25]`, `PAN_X = 2.02`. Arrived at empirically by iterating screenshots at the
fully-scrolled resting state: zoom (FOV) controls how much of the frame the map fills, `PAN_X`
controls how far left the whole rig shifts to clear the right-docked control panel. The
northeast cluster's mainland sliver sits very close to the panel's left edge at this setting —
tried pushing further left, but past a point the whole northeast cluster (pylons included) went
fully behind/occluded by the panel, which is worse than a small sliver near the edge. If the
control panel's own position/width changes later, re-tune `PAN_X` and `fov` the same way: scroll
to the fully-revealed state, screenshot, adjust.

## Known follow-ups / not done

- No real-time shadow mapping (`castShadow`/`receiveShadow` + configured shadow camera) — skipped
  to avoid tuning risk on the first pass; the lighting/material contrast alone already sells the
  "raised 3D platform" look reasonably well. Contact shadows or a real shadow map would be a
  natural next polish pass.
- No orbit controls — camera is intentionally fixed per the brief ("stable... not a game
  camera").
- Pylon `onSelect` is wired but `TransmissionNetwork` doesn't pass a handler yet (clicking a
  pylon currently no-ops safely rather than doing anything) — spec called this optional.
- Tilt/extrusion/lighting constants (`EXTRUDE_HEIGHT`, tower proportions, light angles/intensities)
  are first-pass values tuned by eye against the actual render, not derived from a formula — fine
  to keep adjusting the same way (screenshot, tweak, re-screenshot).

## Progress log

- 2026-08-12/13: CSS-tilt version built and verified on `feature/3d-hero-map` (see that branch's
  own history/commits for its context).
- 2026-08-13: Full WebGL rebuild on `feature/webgl-grid-3d`. Branched from `master` (not from the
  CSS-tilt branch, since none of that code is reused). Built geo3d.ts/grid3d.ts data layer, all
  `three/*` components, wired into `HeroSection` behind the old `HeroMap` prop contract, verified
  end-to-end with Playwright against the real dev server (screenshots + computed-transform
  checks), found and fixed the four bugs listed above, deleted the now-dead `HeroMap.tsx`/
  `TransmissionLayer.tsx`, confirmed a clean `next build`.
