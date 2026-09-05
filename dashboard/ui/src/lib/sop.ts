import type { SopDiscom, SopIndicator } from './types';

/** Identity key for grouping a DISCOM's SoP indicator rows into one time series across years.
 * SoP indicator names are never normalized/canonicalized (see CLAUDE.md) — this only groups rows
 * that reported the exact same "Indicator Type"/"Indicator" text under one DISCOM, so a series
 * never silently merges two different indicators or infers a shared identity across DISCOMs. */
export function sopSeriesKey(ind: Pick<SopIndicator, 'type' | 'indicator'>): string {
  return `${ind.type ?? ''}::${ind.indicator ?? ''}`;
}

export interface SopSeriesPoint {
  year: string;
  entry: SopIndicator | null;
}

export interface SopSeries {
  key: string;
  type: string | null;
  indicator: string | null;
  /** Indicator meaning — taken from whichever year first reported it (source text, never rewritten). */
  meaning: string | null;
  points: SopSeriesPoint[];
}

/** One time series per unique (Indicator Type, Indicator) pair this DISCOM ever reported, aligned
 * across every FY the dataset covers (missing years become a null-entry point, never a fabricated
 * zero). Deterministic and lossless — no averaging, no picking "the" value across years. */
export function buildSopSeries(discom: SopDiscom, yearsAsc: string[]): SopSeries[] {
  const byKey = new Map<string, SopSeries>();
  for (const year of yearsAsc) {
    const y = discom.years[year];
    if (!y) continue;
    for (const ind of y.indicators) {
      const key = sopSeriesKey(ind);
      if (!byKey.has(key)) {
        byKey.set(key, { key, type: ind.type, indicator: ind.indicator, meaning: ind.meaning, points: [] });
      }
      const s = byKey.get(key)!;
      if (!s.meaning && ind.meaning) s.meaning = ind.meaning;
    }
  }
  for (const s of byKey.values()) {
    s.points = yearsAsc.map((year) => {
      const y = discom.years[year];
      const entry = y?.indicators.find((ind) => sopSeriesKey(ind) === s.key) ?? null;
      return { year, entry };
    });
  }
  return Array.from(byKey.values());
}

/** Whether a series has at least one year with a plottable numeric reported value. */
export function sopSeriesHasNumericPoint(series: SopSeries): boolean {
  return series.points.some((p) => p.entry?.reported != null);
}
