import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ToastProvider } from '@/components/ui/toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Innovation Lab | National Bank of Canada + Vaultix',
    template: '%s | Innovation Lab',
  },
  description:
    'Virtual Hackathons & Challenges Platform - Build innovative solutions, compete with teams, win prizes, and unlock achievements',
  keywords: [
    'hackathon',
    'innovation',
    'challenges',
    'fintech',
    'NBC',
    'Vaultix',
    'coding competition',
  ],
  authors: [{ name: 'Innovation Lab Team', url: 'https://innovationlab.example.com' }],
  creator: 'National Bank of Canada',
  publisher: 'National Bank of Canada',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://innovationlab.example.com',
    title: 'Innovation Lab - Virtual Hackathons & Challenges',
    description: 'Build innovative solutions, compete with teams, win prizes',
    siteName: 'Innovation Lab',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Innovation Lab',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Innovation Lab',
    description: 'Virtual Hackathons & Challenges Platform',
    images: ['/og-image.png'],
    creator: '@innovationlab',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ToastProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
