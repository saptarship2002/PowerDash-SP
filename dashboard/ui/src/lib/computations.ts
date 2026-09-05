import { CATEGORICAL, MAP_STATUS } from './colors';
import type { AccessibilityData, Discom, DiscomsData, IndicatorEntry, StateSpecificData } from './types';

export function indicatorsInScope(discoms: DiscomsData, group: string, indicator: string): string[] {
  return discoms.canonical_order.filter((k) => {
    if (indicator !== 'all') return k === indicator;
    if (group !== 'all') return discoms.canonical_indicators[k].group === group;
    return true;
  });
}

/** Color assigned to a state currently in the comparison set, by selection order (null if not selected). */
export function compareColor(compareSet: string[], name: string): string | null {
  const idx = compareSet.indexOf(name);
  return idx === -1 ? null : CATEGORICAL[idx % CATEGORICAL.length];
}

/** Whether the Standards-of-Performance dataset has anything at all to show for this state — a
 * per-DISCOM sheet with its own SoP indicators, or (for the 5 states with no reported SoP figures
 * at all) the regulatory-framework listing. Either is real page content, even when every reported
 * value in it is null. Used only to widen "in scope" — see stateIsTracked — never treated as
 * "has reported data" on its own (a framework listing has no reported figures by definition). */
export function stateHasSopData(stateSpecific: StateSpecificData | null | undefined, state: string): boolean {
  if (!stateSpecific) return false;
  return stateSpecific.discoms.some((d) => d.state === state) || stateSpecific.frameworks.some((f) => f.state === state);
}

/** Whether this state is in ACPET's scope at all (year-independent) — gates whether it's on the
 * map as anything but "Coming soon". True if either dataset tracks it, even if neither has a
 * reported figure yet (see stateMapStatus for the "tracked but no data" split). */
export function stateIsTracked(discoms: Discom[], state: string, stateSpecific?: StateSpecificData | null): boolean {
  return discoms.some((d) => d.state === state) || stateHasSopData(stateSpecific, state);
}

/** Whether this state has an actual reported figure anywhere — a reliability indicator value, or
 * a SoP indicator's reported value — in any year, in either dataset. A SoP regulatory-framework
 * listing alone (standards and benchmarks with no reported data by definition) does NOT count:
 * this specifically answers "is there real performance data to explore", which is what
 * distinguishes the map's "Tracked" fill from "Tracked — Data Not Reported". */
export function stateHasReportedData(discoms: Discom[], state: string, stateSpecific?: StateSpecificData | null): boolean {
  const reliabilityReported = discoms
    .filter((d) => d.state === state)
    .some((d) => Object.values(d.years).some((y) => Object.values(y.indicators).some((i) => i.value != null)));
  if (reliabilityReported) return true;
  return !!stateSpecific?.discoms
    .filter((d) => d.state === state)
    .some((d) => Object.values(d.years).some((y) => y.indicators.some((i) => i.reported != null)));
}

export type StateMapStatus = 'tracked' | 'no-data' | 'idle';

/** Three-way map status for a state: 'idle' (outside ACPET's scope in both datasets — "Coming
 * soon", not clickable), 'no-data' (in scope, but no reported figure anywhere yet — still
 * clickable, since a SoP framework listing or an all-null DISCOM sheet is real content worth
 * seeing, just not performance data), or 'tracked' (has an actual reported figure somewhere). */
export function stateMapStatus(discoms: Discom[], state: string, stateSpecific?: StateSpecificData | null): StateMapStatus {
  if (!stateIsTracked(discoms, state, stateSpecific)) return 'idle';
  return stateHasReportedData(discoms, state, stateSpecific) ? 'tracked' : 'no-data';
}

/** Map fill by status — a muted terracotta/clay for states with reported data, a lighter tint of
 * that same clay for states entirely outside ACPET's tracked scope, and an off-white for
 * tracked states still awaiting reported data. */
export function stateFillColor(status: StateMapStatus): string {
  if (status === 'tracked') return MAP_STATUS.tracked;
  if (status === 'no-data') return MAP_STATUS.noData;
  return MAP_STATUS.idle;
}

/** Most common numeric benchmark among a set of indicator entries (raw, not reinterpreted). */
export function representativeBenchmark(entries: IndicatorEntry[]): number | null {
  const nums = entries.filter((e) => e.benchmark != null && !Number.isNaN(parseFloat(e.benchmark))).map((e) => parseFloat(e.benchmark as string));
  if (!nums.length) return null;
  const counts = new Map<number, number>();
  for (const v of nums) counts.set(v, (counts.get(v) || 0) + 1);
  let best: number | null = null;
  let bestN = -1;
  for (const [v, n] of counts) {
    if (n > bestN) {
      best = v;
      bestN = n;
    }
  }
  return best;
}

export function discomsInScope(discoms: Discom[], compareSet: string[]): Discom[] {
  if (compareSet.length) return discoms.filter((d) => compareSet.includes(d.state));
  return discoms;
}

export interface ComparableIndicator {
  key: string;
  comparable: boolean;
  missingIn: string[];
}

export function comparableIndicators(discoms: Discom[], canonicalOrder: string[], compareSet: string[], year: string): ComparableIndicator[] {
  return canonicalOrder.map((key) => {
    const perState = compareSet.map((name) => {
      const ds = discoms.filter((d) => d.state === name);
      const hasData = ds.some((d) => d.years[year]?.indicators[key]?.value != null);
      return { name, hasData };
    });
    return { key, comparable: perState.every((p) => p.hasData), missingIn: perState.filter((p) => !p.hasData).map((p) => p.name) };
  });
}

/** One state's direct aggregation of its licensees' accessibility booleans — a count/percentage
 * summary, never a weighted or composite score. `publishedPct`/`machineReadablePct` are `null`
 * only when the state has zero tracked licensees to divide by. */
export interface StateAccessibilityCoverage {
  state: string;
  regulationAvailable: boolean | null;
  licenseeCount: number;
  publishedCount: number;
  machineReadableCount: number;
  publishedPct: number | null;
  machineReadablePct: number | null;
}

export function accessibilityByState(accessibility: AccessibilityData): StateAccessibilityCoverage[] {
  const regByState = new Map(accessibility.states.map((s) => [s.state, s.regulation_available]));
  return accessibility.state_order.map((state) => {
    const group = accessibility.discoms.filter((d) => d.state === state);
    const publishedCount = group.filter((d) => d.available_on_serc === true).length;
    const machineReadableCount = group.filter((d) => d.machine_readable === true).length;
    return {
      state,
      regulationAvailable: regByState.get(state) ?? null,
      licenseeCount: group.length,
      publishedCount,
      machineReadableCount,
      publishedPct: group.length ? Math.round((100 * publishedCount) / group.length) : null,
      machineReadablePct: group.length ? Math.round((100 * machineReadableCount) / group.length) : null,
    };
  });
}

/** Sorted for the state comparison chart only (machine-readable % desc, then published % desc) —
 * every other view (grid, small-multiples, matrix) keeps `state_order` so it stays directly
 * comparable to the source workbook. Array.prototype.sort is stable, so states tied on both
 * percentages keep their original state_order position as the tie-break. */
export function sortStatesForComparison(coverage: StateAccessibilityCoverage[]): StateAccessibilityCoverage[] {
  return [...coverage].sort((a, b) => {
    const machineDelta = (b.machineReadablePct ?? -1) - (a.machineReadablePct ?? -1);
    if (machineDelta !== 0) return machineDelta;
    return (b.publishedPct ?? -1) - (a.publishedPct ?? -1);
  });
}

/** Direct counts of where accessibility breaks down across every tracked licensee — never a
 * derived score. */
export interface AccessibilityGaps {
  notPublished: number;
  publishedNotMachineReadable: number;
}

export function accessibilityGaps(accessibility: AccessibilityData): AccessibilityGaps {
  return {
    notPublished: accessibility.discoms.filter((d) => d.available_on_serc !== true).length,
    publishedNotMachineReadable: accessibility.discoms.filter((d) => d.available_on_serc === true && d.machine_readable !== true).length,
  };
}
