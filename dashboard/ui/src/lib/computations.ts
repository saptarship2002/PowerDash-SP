import { CATEGORICAL, MAP_STATUS } from './colors';
import type { Discom, DiscomsData, IndicatorEntry } from './types';

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

/** Whether this state has any tracked DISCOM at all (year-independent) — gates whether it's
 * even in ACPET's scope. Only states ACPET doesn't track at all are excluded from the map;
 * a tracked state stays in scope even in a year where it happens to have no reported data (see
 * stateMapStatus for the "tracked but no data" split). */
export function stateIsTracked(discoms: Discom[], state: string): boolean {
  return discoms.some((d) => d.state === state);
}

/** Whether any of this state's DISCOMs have ever reported a value for any indicator, in any
 * year — year-independent, same as stateIsTracked. */
export function stateHasReportedData(discoms: Discom[], state: string): boolean {
  return discoms
    .filter((d) => d.state === state)
    .some((d) => Object.values(d.years).some((y) => Object.values(y.indicators).some((i) => i.value != null)));
}

export type StateMapStatus = 'tracked' | 'no-data' | 'idle';

/** Three-way map status for a state: 'idle' (outside ACPET's tracked scope entirely), 'no-data'
 * (tracked, but no DISCOM has ever reported a value for any indicator), or 'tracked' (has
 * reported data). Only 'tracked' is clickable through to the full state report. */
export function stateMapStatus(discoms: Discom[], state: string): StateMapStatus {
  if (!stateIsTracked(discoms, state)) return 'idle';
  return stateHasReportedData(discoms, state) ? 'tracked' : 'no-data';
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
