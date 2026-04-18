import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Design Resources for Developers',
  description:
    'A curated collection of design resources for developers - UI graphics, fonts, colors, icons, and more.',
  keywords: [
    'design resources',
    'UI graphics',
    'fonts',
    'icons',
    'colors',
    'web design',
    'developer tools',
  ],
  authors: [{ name: 'Design Resources' }],
  openGraph: {
    title: 'Design Resources for Developers',
    description: 'A curated collection of design resources for developers',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <TooltipProvider delayDuration={100} skipDelayDuration={50}>
          <Header />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
