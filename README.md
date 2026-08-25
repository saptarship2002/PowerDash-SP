# Power Dashboard — working notes

This is the running notebook for this repo: what the codebase actually is, how the
pieces fit together, and a dated log of what's been done in each session, so future-me
(or future-you) can reconstruct *why* something is the way it is without re-reading
every file again. Append to the **Session log** at the bottom each time something
meaningful changes; keep the architecture sections above it updated only when the
architecture itself changes.

## What this is

The **ACPET DISCOM Performance Dashboard** — a Next.js site that shows how India's
electricity distribution companies (DISCOMs) perform against the reliability/quality
standards set by their state regulators (SERCs), and lets you compare them across
states. Two halves:

1. **Data pipeline** — standalone Python scripts (`dashboard/*.py`) that read Excel
   workbooks in `dashboard/data/` and flatten them into JSON. Run manually, not on a
   build step or a schedule.
2. **Frontend** — a Next.js 16 / React 19 app in `dashboard/ui/` that fetches those
   JSON files client-side and renders the map, scorecards, comparisons, and reports.

There is **no backend/API and no database**. Data flows one direction: Excel →
Python script → static JSON file → fetched by the browser at runtime.

## Repo layout

```
dashboard/
├── data/                        source workbooks + pipeline output (repo-root copies)
│   ├── Common Indicators.xlsx        ← current source: 35 DISCOMs, ~12 states, 5 FYs
│   ├── ACCESSIBILITY.xlsx             ← current source: SERC publication/accessibility data
│   ├── PQ_Dashboard_ACPET.xlsx        ← OLD source (13 licensees, 5 states, FY21-22 only)
│   ├── discoms2.json                   ← output of extraction_common.py (current)
│   ├── discoms.json                    ← output of extraction3.py (old, archived pipeline)
│   └── india-states.geojson
├── extraction_common.py         CURRENT: Common Indicators.xlsx → discoms2.json
├── extraction_accessibility.py  CURRENT: ACCESSIBILITY.xlsx → ui/public/data/accessibility.json
├── extraction3.py               OLD: PQ_Dashboard_ACPET.xlsx → discoms.json (feeds _archive_old_ui only)
├── extraction.py, extraction2.py  ad-hoc one-off inspection scripts, not part of any pipeline
├── PROJECT_EXPLANATION.md       design log for the OLD single-file HTML dashboard — outdated
│                                 relative to the current Next.js app, kept for history
├── _archive_old_ui/             the original single-file HTML/Chart.js dashboard (generate_dashboard.py
│                                 + build_index.py + index.html) — superseded, not run or maintained
└── ui/                          the live Next.js app
    ├── context.md               working log for a since-reverted "3D grid map" experiment
    │                             (see Archived experiments below) — historical only
    ├── public/data/              JSON the browser actually fetches at runtime:
    │   ├── discoms2.json           (manually copied from ../../data/discoms2.json — no build step)
    │   ├── accessibility.json      (written here directly by extraction_accessibility.py)
    │   └── india-states.geojson
    └── src/
        ├── app/                Next.js App Router pages: / , /accessibility, /methodology,
        │                       /compare, /state/[name]
        ├── components/         HeroMap/HeroSection (2D map), ScoreCard, CompareView/ComparePanel,
        │                       StateDetail, AccessibilityView, MethodologyView, Sidebar
        └── lib/                DataContext (client-side fetch of the 3 JSON files above),
                                types.ts (shape of discoms2.json/accessibility.json), colors.ts,
                                computations.ts, slug.ts, grid.ts/gridConnections.ts
```

## Data pipeline — current

Source of truth is `dashboard/data/Common Indicators.xlsx` (one sheet per DISCOM,
repeated per-financial-year blocks) and `dashboard/data/ACCESSIBILITY.xlsx` (flat,
no years).

1. `python3 extraction_common.py` (run from `dashboard/`) — parses every sheet,
   normalizes ~20 raw indicator-name variants into 8 canonical indicators (SAIDI,
   SAIFI, MAIFI, CAIDI, Voltage Variation, Harmonics, Transformer Failure, Billing
   Complaint Resolution), computes a per-DISCOM-per-year **composite score** (see
   Methodology below), and writes `data/discoms2.json`.
2. `python3 extraction_accessibility.py` — parses `ACCESSIBILITY.xlsx` and writes
   straight to `ui/public/data/accessibility.json` (no intermediate copy — there's no
   build step to route it through, so it's written directly where the app fetches it).
3. **Manual step, easy to forget:** copy the new `data/discoms2.json` into
   `ui/public/data/discoms2.json` — nothing does this automatically. If the dashboard
   looks stale after re-running the pipeline, this is the first thing to check.

`extraction.py` / `extraction2.py` are throwaway inspection scripts (print raw cell
values to stdout) — not part of the pipeline, safe to ignore.

## Data pipeline — old/archived

`extraction3.py` reads the old `PQ_Dashboard_ACPET.xlsx` (13 licensees, 5 states, a
single FY) and writes `data/discoms.json`. That file only feeds `_archive_old_ui/`'s
`generate_dashboard.py` → single-file `index.html` (Chart.js via CDN, no server, no
Next.js) — the dashboard's original form before it was rebuilt as the current Next.js
app. `PROJECT_EXPLANATION.md` documents that old version's design decisions in detail
(comparability scoring rationale, per-state indicator quirks, chart-iteration
history) — still useful background on *why* certain data quirks are handled the way
they are, but its file paths and pipeline (`extraction3.py → generate_dashboard.py →
index.html`) no longer describe the live app.

## Scoring methodology (current, `extraction_common.py`)

No source sheet grades a DISCOM, so a **composite score** is computed per DISCOM per
year, purely from that DISCOM's own reported columns:

| Dimension | Weight | Formula |
|---|---|---|
| Standards Availability | 25% | indicators with a real standard specified ÷ 8 |
| Data Reported | 25% | indicators with an actual reported value ÷ 8 |
| Genuinely Comparable | 30% | indicators marked "Comparison Possible: Yes" **and** with a reported value ÷ 8 |
| Compliance | 20% | of the genuinely-comparable indicators, % where "Standard Met: Yes" |

Grade: **A** ≥ 70, **B** ≥ 45, **C** below.

The "genuinely comparable" dimension deliberately does **not** trust a sheet's own
"Comparison Possible: Yes" at face value if no value was actually reported for that
indicator — that mismatch is tracked separately as `phantom_comparable_count` so it
surfaces as a data-integrity flag rather than silently inflating the score.

## Archived experiments (do not resurrect without reading `ui/context.md`)

A 3D/isometric WebGL rebuild of the hero map (react-three-fiber, extruded state
geometry, animated pylons/transmission lines) was built and iterated on across several
rounds, then **explicitly reverted** — see the git log entry `Rebuild map as 2D
static-export site, drop 3D Grid Explorer`. The current live map (`HeroMap.tsx` +
`HeroSection.tsx`) is the flat 2D d3-geo SVG version. `ui/context.md` is that
experiment's full working log (decisions, bugs found/fixed, rollback commits) — kept
for history in case the 3D direction gets revisited, but it does not describe anything
currently running.

## Running it

```bash
cd dashboard/ui
npm install          # first time only
npm run dev           # http://localhost:3000 (falls back to 3001+ if 3000 is taken)
```

No env vars, no backend, no database. `npm run build && npm run start` for a
production build.

## Session log

### 2026-08-21
- Ran the app for the first time this session: `npm install` in `dashboard/ui/`,
  `npm run dev` (port 3000 was already occupied by another process → served on 3001),
  verified with a Playwright smoke screenshot (headless Chromium — no `chromium-cli`
  available in this environment, so used a one-off Playwright script instead) — home
  page renders the India map + sidebar, zero console errors.
- Read through the full codebase to understand current vs. legacy pipelines. Notable
  finding: **there are two independent, differently-shaped data pipelines** in
  `dashboard/` — the current one (`extraction_common.py` + `extraction_accessibility.py`
  → `discoms2.json`/`accessibility.json` → Next.js app) and an old one (`extraction3.py`
  → `discoms.json` → `_archive_old_ui`'s single-file HTML dashboard). `PROJECT_EXPLANATION.md`
  documents only the old one and is easy to mistake for current docs — it isn't.
- Confirmed `dashboard/data/discoms2.json` and `dashboard/ui/public/data/discoms2.json`
  are currently in sync (identical md5), but the copy between them is a manual step
  with nothing enforcing it — worth double-checking after any future pipeline re-run.
- Created this README as the durable place to keep this kind of note going forward.
