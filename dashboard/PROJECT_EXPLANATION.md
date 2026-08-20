# ACPET Power Quality Dashboard — Project Explanation

**Project:** Multi-State Power Quality & Reliability Dashboard
**Data Source:** `data/PQ_Dashboard_ACPET.xlsx`
**Reporting Period:** FY 2021-22
**Jurisdiction:** Maharashtra · Gujarat · Madhya Pradesh · Rajasthan · Odisha

---

## 1. What changed from the previous version

The source workbook was replaced entirely. The old file had 5 Gujarat DISCOMs plus a
scoring/grading sheet; the new file has **13 distribution-licensee sheets across 5
states**, each in its own per-state regulatory format, and **no grading sheet at all**.
This dashboard was rebuilt from scratch against the new structure rather than patched.

Two sheets (`Sheet13`, `Sheet14`) are exact blank duplicates of the TPCODL/TPNODL
template with no data in them — excluded as non-data artifacts, not counted as
licensees.

## 2. Pipeline

1. **`extraction3.py`** — reads all 13 real sheets, normalizes every reported value to
   a consistent unit (SAIDI/CAIDI → hours, SAIFI/MAIFI → count/year, everything else →
   0-100%), and computes a **comparability score** per licensee purely from the sheet's
   own columns (there is no scoring sheet to source it from). Output: `data/discoms.json`.
2. **`generate_dashboard.py`** — shapes that normalized data into chart-ready series
   (grouping DISCOMs by state, assigning colors, splitting indicators that mean
   different things in different states into separate charts — see §4) and computes the
   comparability heatmap. Output: `data/dash.json`.
3. The JSON is embedded directly into `index.html` (no fetch, no backend — same
   single-file approach as before) and rendered with Chart.js.

Re-run both scripts in order after editing the source workbook.

## 3. The comparability score (replacing the old grade)

No sheet in the new workbook grades licensees, so each score is computed here:

| Dimension | Weight | Formula |
|---|---|---|
| Standards Availability | 25% | indicators with a real standard specified ÷ total |
| Data Reported | 25% | indicators with an actual reported value ÷ total |
| Genuinely Comparable | 30% | indicators where the sheet says "Yes" **and** a value was reported ÷ total |
| Compliance | 20% | of the genuinely-comparable indicators, % where the standard was met |

Grade A ≥ 70, B ≥ 45, C below.

**Important nuance:** the "Genuinely Comparable" and "Compliance" dimensions
deliberately do **not** just trust the sheet's own "Comparison Possible" / "Standard
Met" columns. JVVNL (Jaipur) marks 6 of its 8 indicators "Comparison Possible: Yes" /
"Standard Met: Yes" despite reporting **no actual value** for any of them. Taking that
at face value would have given it an inflated score; instead a reported value is
required before an indicator counts as comparable, and the discrepancy itself is
surfaced as a "phantom comparability" flag on its scorecard and in the heatmap (red
`Yes*` cells).

## 4. Indicators that mean different things in different states

The same indicator label doesn't always mean the same thing across sheets — charting
them together without noticing this would produce a misleading comparison:

- **Transformer Failure** — a restoration-**compliance** % (higher = better,
  benchmarked at 90–95%) everywhere except Gujarat, where it's a raw **failure rate**
  (lower = better, no benchmark). Charted as two separate charts.
- **Billing Complaint Resolution** — a complaint-**resolution-speed** % everywhere
  except Odisha (TPCODL/TPNODL), which instead reports bill **accuracy** (% of bills
  that were faulty). Odisha is excluded from the billing chart.
- **Voltage Variation** — a sample-test compliance % (Gujarat), a case-resolution %
  (Maharashtra, Rajasthan), and a raw complaint **count** (Odisha — 0 complaints, not a
  percentage). The first two are charted together with the distinction in the tooltip;
  Odisha is excluded from the % chart entirely.

## 5. Notable data-quality findings (see the Key Gaps section on the dashboard)

- No state except Rajasthan (and partially Maharashtra/TPCODL) has a numerical
  regulatory benchmark for SAIDI, SAIFI, CAIDI or MAIFI — most reliability comparisons
  are marked "No" by the regulator's own sheet.
- SAIDI's raw units are inconsistent within the source file itself: plain minutes,
  an Hr:Min clock value, and multi-day durations all appear across different sheets.
  All were normalized to hours here.
- PGVCL (~209 hrs/yr) and TPCODL (~155 hrs/yr) SAIDI are 5-10x every other licensee —
  real outliers worth verifying at source.
- TPNODL reported zero values for all 8 of its indicators; three Madhya Pradesh zones
  (MPEZ/MPWZ/MPCZ) reported zero values for all 6 reliability/power-quality indicators,
  filling in only billing and transformer-restoration figures.

## 6. Design decisions

- **Font & chrome:** kept the existing ACPET brand style (Barlow Condensed, charcoal
  header, red hero band, white background, thin-border cards) for continuity.
- **Color system:** each of the 5 states gets a fixed hue (validated for colorblind-safe
  adjacent-pair contrast); licensees within a state get shades of that hue. Color is
  never the sole identity channel — every mark is paired with a text label.
- **State filter:** a sticky filter bar re-renders scorecards, the heatmap, and dims
  non-matching bars in every chart without reloading the page.
- **Chart library:** Chart.js 4.4 via CDN — no build step, single HTML file, data
  embedded inline so it works from a plain `file://` open with no server.

## 7. Visual density pass — multiple chart forms

The first pass leaned almost entirely on grouped vertical bar charts. A second pass
added variety so the same data is read through several chart forms, each chosen because
it surfaces something the bar charts don't:

- **Scorecard mini radar charts** — each of the 13 licensee scorecards originally showed
  its 4 scoring dimensions (Standards / Data reported / Comparable / Compliant) as flat
  CSS progress bars. These were replaced with a small per-card Chart.js radar (4 axes)
  next to the exact percentages, so each licensee gets a distinctive "shape" at a glance
  instead of four identical-looking bars. `n/a` compliance (no comparable indicators)
  plots as 0 on that axis but reads as "not applicable" in the tooltip and the number
  beside it, never silently as a real zero.
- **New "Analytics Overview" section** (between the scorecards and the per-indicator
  bar charts) added six cross-cutting views, computed in `generate_dashboard.py` from
  the same normalized data:
  - **Grade distribution** and **comparability distribution** doughnuts — aggregate
    counts (A/B/C grades; Yes/No/N-A/Phantom across all 104 licensee × indicator cells),
    both recomputed live when the state filter changes.
  - **SAIDI-vs-SAIFI comparison** — duration vs. frequency for the 8 licensees reporting
    both, making PGVCL (high duration) and TPCODL (high frequency) visible as outliers
    in different directions rather than just tall bars in two separate charts. (Originally
    a scatter plot; replaced with a grouped bar in §8 below because unlabeled dots were
    unreadable in a static screenshot.)
  - **Composite score, ranked** — a line/area chart of all 13 composite scores sorted
    descending, with dashed reference lines at the A (70) and B (45) grade thresholds,
    showing the score distribution has a real cliff after the top 5 rather than a
    smooth gradient.
  - **Comparability breakdown per licensee** — a stacked horizontal bar (Yes / No / N-A
    / Phantom counts per licensee) as a compact companion to the full heatmap table,
    with JVVNL (Jaipur)'s phantom-comparability problem visible as a red segment.

All of the above are wired into the same state-filter mechanism as the original bar
charts (a `beforeUpdate` Chart.js plugin per chart recomputes/masks its data against
`stateMatch()`), so filtering by state updates every chart on the page, not just some.

## 8. Third pass — bigger charts, no radar, no dead space, no charts on empty data

User feedback after §7 landed on three more things:

- **"Bar looks stupid" / replace radar with something else.** Two radar charts existed:
  a small per-scorecard one (Standards/Data/Comparable/Compliant) and a bigger one
  comparing Gujarat's 4 DISCOMs across SAIDI/SAIFI/MAIFI/CAIDI. Both are gone now.
  - Per-scorecard: replaced with a real Chart.js horizontal bar (not the old flat CSS
    progress-bar div either) with the value drawn at the bar's tip via a small custom
    `afterDatasetsDraw` plugin (`barEndLabelPlugin`), so the number and the bar are one
    mark instead of a bar plus a separate text column.
  - Gujarat comparison: replaced with a grouped vertical bar chart (x-axis = SAIDI /
    SAIFI / MAIFI / CAIDI, one bar per DISCOM per category) — same normalized 0-100
    "100 = best in group" values as the old radar, just readable without a legend
    decoder ring.
- **"Make this cover the entire space."** The scorecard grid used
  `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`, which reserves
  fixed-width tracks even when a state (e.g. Maharashtra, MSEDCL alone) has only one
  card — leaving most of the row blank. Changed `auto-fill` → `auto-fit`, which collapses
  unused tracks and lets the remaining card(s) stretch to fill the row.
- **"Don't create a graph for sheets with no data."** JVVNL (Jaipur) and TPNODL report
  zero values for every one of their 8 indicators (`data_reported_pct === 0`). Their
  scorecards now render a dashed-border "No data reported ... nothing to chart" placeholder
  in place of the bar chart — the gap sentence and phantom-comparability flag still
  explain *why*, but no chart is drawn over empty data.
- **Scatter plot → grouped bar.** The SAIDI-vs-SAIFI scatter had no point labels, so a
  static view of it was just 8 unlabeled dots — impossible to tell which licensee was
  which without hovering. Replaced with a grouped bar chart: both metrics indexed to a
  single 0-100 scale (100 = highest raw value among the 8, a plain magnitude index, not
  a performance score), one pair of bars per licensee, licensee names directly on the
  x-axis, actual hours/count values in the tooltip. Single axis throughout — no dual-axis
  trick was used to force duration and frequency onto one chart.
- All chart canvas heights were increased across the board (300→440px default,
  360→500px for "tall" charts, 440→560px for the 13-row stacked bar) and every section
  that paired two charts side-by-side now stacks them full-width instead, so each chart
  gets the whole page width rather than half of it.

## 9. Removed the Gujarat-only chart from the pooled Analytics Overview section

The grouped-bar replacement for the old radar (SAIDI/SAIFI/MAIFI/CAIDI performance,
Gujarat's 4 DISCOMs) lived in "Cross-Cutting Views" — a section whose whole point is
pooling data across all 5 states. Having one chart in there that only ever showed
Gujarat was a real inconsistency: switching the state filter to anything but
Gujarat/All left it visibly empty, and even on "All States" it only ever represented
4 of 13 licensees while sitting next to genuinely pooled charts (grade distribution,
comparability distribution, the ranked score line, the duration-vs-frequency bars).
Removed it entirely rather than patch it — the same SAIDI/SAIFI/MAIFI/CAIDI values are
already visible, for all 8 licensees that report them, in the per-indicator bar charts
further down the page. `radar_performance` was deleted from `generate_dashboard.py`'s
output and the corresponding chart/canvas from `index.html`.

## 10. Fixed the composite-score chart to actually respect state grouping

Every chart in the dashboard lists licensees in state order (Maharashtra → Gujarat →
Madhya Pradesh → Rajasthan → Odisha) except one: `score_ranked` was built with
`sorted(..., key=score, reverse=True)`, a pure global sort with no regard for state —
so its x-axis interleaved states in whatever order the scores happened to fall
(AVVNL/Rajasthan next to MPEZ/Madhya Pradesh next to TPCODL/Odisha, etc.), which broke
the one visual convention every other chart and the scorecards follow. Fixed by sorting
licensees into `STATE_ORDER` first and only ranking by composite score *within* each
state block. Renamed the chart from "Composite score, ranked" to "Composite score by
licensee" since it's no longer a pure global ranking — the sub-caption now says so
explicitly ("grouped by state ... ranked within each state").

---

*Generated from `data/PQ_Dashboard_ACPET.xlsx` (13 licensee sheets, 5 states) via
`extraction3.py` → `generate_dashboard.py` → `index.html`.*
"I'd only make 4 tiny refinements


1. Tone down the giant background pylons ~15–25%.
They're finally working, but some of the structures behind the map are still quite prominent. They should register subconsciously.

2. Make the actual map transmission pylons slightly more visible.
The small pylons on the map are currently almost blending into the geography. A tiny increase in contrast would make the energy-network concept clearer.

4. Fix the viewport/scroll behavior.
The screenshot shows a vertical scrollbar. If this dashboard is intended to be a single-screen visualization, I'd make the main dashboard fit the viewport without unnecessary scrolling."
.
mke these changes