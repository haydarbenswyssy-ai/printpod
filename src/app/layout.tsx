import type { Metadata } from 'next';
import { DM_Sans, Bebas_Neue } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DevBanner from '@/components/DevBanner';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'PrintPod — Design. Print. Sell.',
  description: 'Create custom t-shirts and sell them through your own store. Design, upload, and earn.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bebasNeue.variable} h-full`}>
      <body className="min-h-full flex flex-col noise-bg">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <DevBanner />
      </body>
    </html>
  );
}
