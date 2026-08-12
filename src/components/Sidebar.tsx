'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  {
    href: '/',
    label: 'Map Explorer',
    icon: (
      <path d="M3 21V3M7 21v-7M12 21V8M17 21v-11" />
    ),
  },
  {
    href: '/report',
    label: 'Scorecards Report',
    icon: <path d="M4 4v16h7V4H4Zm9 0v16h7V4h-7Z" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="brand">
        
        <div className="brand-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#faf8f3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">ACPET</span>
          <span className="brand-sub">Power Distribution Dashboard</span>
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
        Data: <code>Common Indicators.xlsx</code> · 35 DISCOMs · FY 2021-22 to FY 2025-26
      </div>
    </aside>
  );
}
