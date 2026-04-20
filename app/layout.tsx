import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/header';
import { JsonLd } from '@/components/json-ld';

const inter = Inter({ subsets: ['latin'] });

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Design Resources for Developers',
  description:
    'A curated collection of design resources for developers - UI graphics, fonts, colors, icons, and more.',
  url: 'https://design-resources-for-developers-tau.vercel.app',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate:
        'https://design-resources-for-developers-tau.vercel.app/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://design-resources-for-developers-tau.vercel.app',
  ),
  title: {
    default: 'Design Resources for Developers',
    template: '%s | Design Resources for Developers',
  },
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
    description:
      'A curated collection of design resources for developers - UI graphics, fonts, colors, icons, and more.',
    type: 'website',
    url: '/',
    siteName: 'Design Resources for Developers',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Design Resources for Developers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design Resources for Developers',
    description:
      'A curated collection of design resources for developers - UI graphics, fonts, colors, icons, and more.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://design-resources-for-developers-tau.vercel.app',
  },
  icons: {
    icon: '/favicon.ico',
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
        <JsonLd data={jsonLd} />
        <TooltipProvider delayDuration={100} skipDelayDuration={50}>
          <Header />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
