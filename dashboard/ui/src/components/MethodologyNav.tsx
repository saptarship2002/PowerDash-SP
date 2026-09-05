const SECTIONS = [
  { id: 'm-context', label: 'Context' },
  { id: 'm-scope', label: 'Scope' },
  { id: 'm-indicators', label: 'Indicators' },
  { id: 'm-methodology', label: 'Methodology' },
  { id: 'm-sources', label: 'Sources' },
  { id: 'm-limitations', label: 'Limitations' },
  { id: 'm-provenance', label: 'Provenance' },
];

/** A slim sticky anchor rail — not a sidebar — for a page that's grown long enough to want
 * quick jumps. Plain in-page anchor links, so keyboard/screen-reader navigation and browser
 * back/forward all work for free without any custom scroll-tracking JS. */
export default function MethodologyNav() {
  return (
    <nav className="method-nav" aria-label="Methodology sections">
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} className="method-nav-link">
          {s.label}
        </a>
      ))}
    </nav>
  );
}
