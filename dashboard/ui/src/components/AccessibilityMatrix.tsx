'use client';

import { Fragment, useState } from 'react';
import StatusIcon from './StatusIcon';
import type { DiscomAccessibility } from '@/lib/types';

interface Props {
  discoms: DiscomAccessibility[];
  stateOrder: string[];
  stateHue: Record<string, string>;
  stateFilter: string;
  onStateFilterChange: (state: string) => void;
}

type PublicationFilter = 'all' | 'published' | 'not-published';
type FormatFilter = 'all' | 'machine-readable' | 'not-machine-readable';

/** Every tracked licensee in one shared surface — one header row, subtle state-group dividers,
 * rather than a repeated mini-table per state. State grouping and each state's own licensee order
 * are always preserved (`stateOrder`, source order) regardless of which filters are active —
 * filtering only hides non-matching rows/groups, it never reorders anything. */
export default function AccessibilityMatrix({ discoms, stateOrder, stateHue, stateFilter, onStateFilterChange }: Props) {
  const [publicationFilter, setPublicationFilter] = useState<PublicationFilter>('all');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [search, setSearch] = useState('');
  const [gapsOnly, setGapsOnly] = useState(false);

  const q = search.trim().toLowerCase();

  const matches = (d: DiscomAccessibility) => {
    if (stateFilter !== 'all' && d.state !== stateFilter) return false;
    if (publicationFilter === 'published' && d.available_on_serc !== true) return false;
    if (publicationFilter === 'not-published' && d.available_on_serc === true) return false;
    if (formatFilter === 'machine-readable' && d.machine_readable !== true) return false;
    if (formatFilter === 'not-machine-readable' && d.machine_readable === true) return false;
    if (gapsOnly && d.available_on_serc === true && d.machine_readable === true) return false;
    if (q && !d.abbreviation.toLowerCase().includes(q) && !d.discom.toLowerCase().includes(q)) return false;
    return true;
  };

  const filtered = discoms.filter(matches);
  const gapCount = discoms.filter((d) => !(d.available_on_serc === true && d.machine_readable === true)).length;

  return (
    <div className="access-matrix-surface">
      <div className="toolbar access-matrix-toolbar">
        <div className="toolbar-field">
          <label>State</label>
          <select value={stateFilter} onChange={(e) => onStateFilterChange(e.target.value)}>
            <option value="all">All states</option>
            {stateOrder.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-field">
          <label>Publication</label>
          <select value={publicationFilter} onChange={(e) => setPublicationFilter(e.target.value as PublicationFilter)}>
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="not-published">Not published</option>
          </select>
        </div>
        <div className="toolbar-field">
          <label>Format</label>
          <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value as FormatFilter)}>
            <option value="all">All</option>
            <option value="machine-readable">Machine-readable</option>
            <option value="not-machine-readable">Not machine-readable</option>
          </select>
        </div>
        <input type="search" className="sop-search-input" placeholder="Search licensee…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search licensees" />
        <label className="access-gaps-toggle">
          <input type="checkbox" checked={gapsOnly} onChange={(e) => setGapsOnly(e.target.checked)} />
          Show gaps only
        </label>
      </div>

      <div className="access-matrix-count">
        {gapsOnly ? `${filtered.length} accessibility gap${filtered.length === 1 ? '' : 's'}` : `Showing ${filtered.length} of ${discoms.length} licensees`}
        {!gapsOnly && ` · ${gapCount} accessibility gap${gapCount === 1 ? '' : 's'} overall`}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="access-matrix">
          <thead>
            <tr>
              <th>Licensee</th>
              <th>Data Published</th>
              <th>Machine-Readable</th>
            </tr>
          </thead>
          <tbody>
            {stateOrder.map((state) => {
              const group = filtered.filter((d) => d.state === state);
              if (!group.length) return null;
              return (
                <Fragment key={state}>
                  <tr className="access-matrix-group-row">
                    <th colSpan={3} scope="colgroup">
                      <span className="dot" style={{ background: stateHue[state] }} />
                      {state}
                    </th>
                  </tr>
                  {group.map((d) => (
                    <tr key={d.abbreviation}>
                      <td data-th="Licensee">
                        <span className="access-matrix-abbr">{d.abbreviation}</span>
                        <span className="access-matrix-full"> · {d.discom}</span>
                      </td>
                      <td data-th="Data Published">
                        <StatusIcon status={d.available_on_serc} yesLabel="Published" noLabel="Not published" />
                      </td>
                      <td data-th="Machine-Readable">
                        <StatusIcon status={d.machine_readable} yesLabel="Machine-readable" noLabel="Not machine-readable" />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="detail-placeholder">
                  No licensees match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
