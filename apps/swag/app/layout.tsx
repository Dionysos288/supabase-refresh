import '../styles/globals.css'

import { inter, manrope, sourceCodePro } from '@/fonts'
import type { Metadata, Viewport } from 'next'

const site_title = 'Supabase Archive — Collection 010 "Dark Mode"'

export const metadata: Metadata = {
  title: site_title,
  description:
    'The Supabase merch archive — 31 artifacts, earned not sold. Tees, caps, and community merch, verified authentic, RLS enabled.',
  openGraph: {
    type: 'website',
    url: 'https://supabase.store/',
    siteName: 'Supabase',
    images: [
      {
        url: 'https://supabase.com/images/og/supabase-og.png',
        width: 800,
        height: 600,
        alt: 'Supabase Og Image',
      },
    ],
  },
  twitter: {
    creator: '@supabase',
    site: '@supabase',
    card: 'summary_large_image',
  },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/favicon.ico',
  },
}

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`dark ${manrope.variable} ${inter.variable} ${sourceCodePro.variable}`}
      style={{ colorScheme: 'dark' }}
    >
      <body>{children}</body>
    </html>
  )
}
