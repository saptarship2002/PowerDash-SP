'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AccessibilityData, DiscomsData, IndiaGeoJSON } from './types';

interface DataState {
  discoms: DiscomsData | null;
  geojson: IndiaGeoJSON | null;
  accessibility: AccessibilityData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DataState = { discoms: null, geojson: null, accessibility: null, loading: true, error: null };

const DataCtx = createContext<DataState>(initialState);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(initialState);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/data/discoms2.json').then((r) => r.json()),
      fetch('/data/india-states.geojson').then((r) => r.json()),
      fetch('/data/accessibility.json').then((r) => r.json()),
    ])
      .then(([discoms, geojson, accessibility]) => {
        if (!cancelled) setState({ discoms, geojson, accessibility, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ discoms: null, geojson: null, accessibility: null, loading: false, error: String(err) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <DataCtx.Provider value={state}>{children}</DataCtx.Provider>;
}

export function useData(): DataState {
  return useContext(DataCtx);
}
