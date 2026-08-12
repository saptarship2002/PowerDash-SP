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
