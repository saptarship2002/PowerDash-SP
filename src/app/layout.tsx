import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import { DataProvider } from '@/lib/DataContext';
import Sidebar from '@/components/Sidebar';
import './globals.css';

const montserrat = Montserrat({ variable: '--font-montserrat', subsets: ['latin'], weight: ['300', '400', '500', '600'] });
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ACPET DISCOM Performance Dashboard',
  description:
    'Understanding how electricity distribution companies in India perform with respect to the Standards of Performance specified by their respective State Electricity Regulatory Commissions (SERCs), and assessing comparative performance among states.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
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
