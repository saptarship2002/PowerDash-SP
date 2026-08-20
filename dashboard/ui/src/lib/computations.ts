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

/** Whether this state has any tracked DISCOM at all (year-independent) — gates clickability on
 * the map. A tracked state stays clickable even in a year where it happens to have no reported
 * data; only states ACPET doesn't track at all are excluded. */
export function stateIsTracked(discoms: Discom[], state: string): boolean {
  return discoms.some((d) => d.state === state);
}

/** Map fill is binary: tracked (clickable) or not — whether a tracked state's DISCOMs have
 * actually reported data is deferred to the click-through detail, not shown on the map itself. */
export function stateFillColor(tracked: boolean): string {
  return tracked ? MAP_STATUS.tracked : MAP_STATUS.idle;
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
