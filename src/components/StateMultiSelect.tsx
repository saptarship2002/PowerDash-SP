'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  allStates: string[];
  stateHue: Record<string, string>;
  selected: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
}

export default function StateMultiSelect({ allStates, stateHue, selected, onAdd, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const available = allStates.filter((s) => !selected.includes(s));

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div className="control-field" ref={rootRef}>
      <span className="control-label">Compare States</span>
      <div className="multiselect">
        <button type="button" className="control-select-wrap multiselect-trigger" onClick={() => setOpen((v) => !v)}>
          <span>{selected.length ? `${selected.length} selected` : 'Select states'}</span>
          <svg className="control-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && (
          <div className="multiselect-popover">
            {available.length === 0 ? (
              <div className="multiselect-empty">All states selected</div>
            ) : (
              available.map((s) => (
                <button type="button" key={s} className="multiselect-option" onClick={() => onAdd(s)}>
                  <span className="dot" style={{ background: stateHue[s] || '#999' }} />
                  {s}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="multiselect-chips">
          {selected.map((name) => (
            <span className="multiselect-chip" key={name}>
              <span className="dot" style={{ background: stateHue[name] || '#999' }} />
              {name}
              <button type="button" aria-label={`Remove ${name}`} onClick={() => onRemove(name)}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
