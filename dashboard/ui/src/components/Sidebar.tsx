'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <path d="M3 21V3M7 21v-7M12 21V8M17 21v-11" />
    ),
  },
  {
    href: '/accessibility',
    label: 'Accessibility',
    icon: <path d="M12 3 3 7.5 12 12l9-4.5L12 3Zm-9 9 9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" />,
  },
  {
    href: '/methodology',
    label: 'Methodology',
    icon: <path d="M9 4h6l3 4v12H6V8l3-4Zm-1 8h8M8 15h5" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const toggle = () => setOpen((v) => !v);

  return (
    <>
      <button
        type="button"
        className={`menu-toggle${open ? ' open' : ''}`}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>
      <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-inner">
      <div className="brand">
        
        <div className="brand-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#faf8f3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">ACPET</span>
          <span className="brand-sub">DISCOM Performance Dashboard</span>
        </div>
      
      </div>
      <nav className="sidenav">
        {NAV.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={active ? 'active' : ''}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-foot">
        <div>States: 12</div>
        <div>DISCOMs: 35 (Public)</div>
        <div>Years: FY 2021–22 to FY 2025–26</div>
      </div>
      </div>
      </aside>
    </>
  );
}
