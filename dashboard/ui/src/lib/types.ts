export type IndicatorUnit = 'hours' | 'count' | 'pct';

export interface CanonicalIndicatorMeta {
  group: string;
  unit: IndicatorUnit;
}

export interface IndicatorEntry {
  value: number | null;
  subtypes: Record<string, number | null>;
  standard_specified: string | null;
  benchmark: string | null;
  benchmark_meaning: string | null;
  reported_meaning: string | null;
  unit_note: string | null;
  comparison_possible: boolean;
  standard_met: boolean | null;
}

export interface Scoring {
  total_indicators: number;
  standards_available_pct: number | null;
  data_reported_pct: number;
  comparable_pct: number | null;
  compliance_pct: number | null;
  composite_score: number;
  grade: 'A' | 'B' | 'C';
  phantom_comparable_count: number;
  indicators_reported: number;
}

export interface YearData {
  regulation: string;
  indicators: Record<string, IndicatorEntry>;
  scoring: Scoring;
}

export interface Discom {
  sheet: string;
  full_name: string;
  short_name: string;
  state: string;
  years: Record<string, YearData>;
}

export interface DiscomsData {
  state_order: string[];
  canonical_indicators: Record<string, CanonicalIndicatorMeta>;
  canonical_order: string[];
  years: string[];
  discoms: Discom[];
}

export interface GeoFeature {
  type: string;
  properties: { st_nm: string };
  geometry: unknown;
}

export interface IndiaGeoJSON {
  type: string;
  features: GeoFeature[];
}

export type MapStatus = 'full' | 'partial' | 'none' | undefined;

/** Whether a state's SERC has published its standards-of-performance regulation online — not
 * what the regulation says, just whether it's findable at all. From ACCESSIBILITY.xlsx's
 * REGULATION sheet. `null` means the source data didn't have a Yes/No answer for this row. */
export interface StateAccessibility {
  state: string;
  regulation_available: boolean | null;
}

/** Whether a licensee's reported performance data is published on its state SERC's website, and
 * whether that publication is machine-readable (vs. e.g. a scanned PDF). From
 * ACCESSIBILITY.xlsx's REPORTED DATAPERFORMANCE sheet. `machine_readable` is `null` whenever the
 * source marked it "N/A" — in practice, whenever `available_on_serc` is false, since a format
 * question doesn't apply to data that isn't published at all. */
export interface DiscomAccessibility {
  discom: string;
  abbreviation: string;
  state: string;
  available_on_serc: boolean | null;
  machine_readable: boolean | null;
}

export interface AccessibilitySummary {
  states_total: number;
  states_regulation_available: number;
  discoms_total: number;
  discoms_available_on_serc: number;
  discoms_machine_readable: number;
}

export interface AccessibilityData {
  state_order: string[];
  states: StateAccessibility[];
  discoms: DiscomAccessibility[];
  summary: AccessibilitySummary;
}
