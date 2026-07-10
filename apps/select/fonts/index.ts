import { Inter, Newsreader, Source_Code_Pro } from 'next/font/google'

export const newsreader = Newsreader({
  variable: '--font-newsreader',
  display: 'swap',
  style: ['normal', 'italic'],
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  subsets: ['latin'],
})

export const inter = Inter({
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  subsets: ['latin'],
})

export const sourceCodePro = Source_Code_Pro({
  variable: '--font-source-code-pro',
  display: 'swap',
  fallback: ['Source Code Pro', 'Office Code Pro', 'Menlo', 'monospace'],
  subsets: ['latin'],
})
