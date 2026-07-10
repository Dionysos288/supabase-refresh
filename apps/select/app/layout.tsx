import '../styles/globals.css'

import { inter, newsreader, sourceCodePro } from '@/fonts'
import type { Metadata, Viewport } from 'next'

const site_title = 'Your Ticket — Supabase Select 2026'

export const metadata: Metadata = {
  title: site_title,
  description:
    'Supabase Select — a curated day of talks. Oct 2, 2026. Grab your ticket and share it with the community.',
  openGraph: {
    type: 'website',
    url: 'https://select.supabase.com/',
    siteName: 'Supabase Select',
    images: [
      {
        url: 'https://supabase.com/images/og/supabase-og.png',
        width: 800,
        height: 600,
        alt: 'Supabase Select',
      },
    ],
  },
  twitter: {
    creator: '@supabase',
    site: '@supabase',
    card: 'summary_large_image',
  },
  icons: {
    icon: '/favicon/favicon.svg',
    shortcut: '/favicon/favicon.svg',
    apple: '/favicon/favicon.svg',
  },
}

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
  themeColor: '#0b0c0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`light ${inter.variable} ${sourceCodePro.variable} ${newsreader.variable}`}
      style={{ colorScheme: 'light' }}
    >
      <body>{children}</body>
    </html>
  )
}
