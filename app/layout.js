import { Newsreader, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const serif = Newsreader({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });
const sans = Hind_Siliguri({
  subsets: ['latin', 'bengali'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap',
});

export const metadata = {
  title: 'The Ibn Sina Trust | Healthcare at affordable cost since 1980',
  description: 'Hospitals, diagnostic centers and consultation units across Bangladesh. Find a doctor, book an appointment, locate a branch. Hotline 10615.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
