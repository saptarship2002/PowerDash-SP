import type { Metadata } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import { DataProvider } from '@/lib/DataContext';
import Sidebar from '@/components/Sidebar';
import './globals.css';

const barlow = Barlow({ variable: '--font-barlow', subsets: ['latin'], weight: ['300', '400', '500', '600'] });
const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ACPET Power Distribution Dashboard — Standards & Performance',
  description: 'Comparing electricity service standards and reported performance across India’s distribution utilities.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <DataProvider>
          <div className="app-shell">
            <Sidebar />
            <main className="app-main">{children}</main>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
