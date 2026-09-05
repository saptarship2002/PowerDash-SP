/** "N/A" can mean fundamentally different things (no benchmark exists, a benchmark exists but
 * isn't comparable, the DISCOM simply didn't report a figure, or the sheet just has nothing
 * marked either way) — this distinguishes them rather than collapsing all of them into one
 * generic status, so a compact rail can still communicate which kind of gap it is. */
export type EvidenceStatus = 'met' | 'not-met' | 'not-comparable' | 'no-benchmark' | 'no-value' | 'unavailable';

interface StatusMeta {
  text: string;
  short: string;
  cls: string;
}

export const STATUS_META: Record<EvidenceStatus, StatusMeta> = {
  met: { text: 'Standard met', short: 'Met', cls: 'eviq-met' },
  'not-met': { text: 'Standard not met', short: 'Miss', cls: 'eviq-not-met' },
  'not-comparable': { text: 'Not comparable', short: 'N/C', cls: 'eviq-not-comparable' },
  'no-benchmark': { text: 'No benchmark specified', short: 'No std', cls: 'eviq-no-benchmark' },
  'no-value': { text: 'No value reported', short: 'No data', cls: 'eviq-no-value' },
  unavailable: { text: 'Status unavailable', short: 'N/A', cls: 'eviq-unavailable' },
};

export function evidenceStatus(point: { value: number | null; benchmark: number | null; comparisonPossible: boolean | null; standardMet: boolean | null }): EvidenceStatus {
  if (point.value == null) return 'no-value';
  if (point.comparisonPossible === false) return 'not-comparable';
  if (point.standardMet === true) return 'met';
  if (point.standardMet === false) return 'not-met';
  if (point.benchmark == null) return 'no-benchmark';
  return 'unavailable';
}

/** The value every item shares, or null if there's no single value they all agree on (including
 * when every item is null) — used to lift context that's constant across a series' fiscal years
 * up to the card level instead of repeating it once per year. */
export function allSame<T>(items: (T | null | undefined)[]): T | null {
  const present = items.filter((x): x is T => x != null);
  if (!present.length) return null;
  return present.every((x) => x === present[0]) ? present[0] : null;
}
