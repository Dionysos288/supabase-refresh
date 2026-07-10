import { type Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404: This page could not be found',
  robots: {
    index: false,
  },
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-foreground-muted">
        error 404
      </p>
      <h1 className="text-3xl tracking-tight text-foreground">
        select * from pages returned 0 rows
      </h1>
      <p className="text-sm text-foreground-lighter">
        No route matched this path. Check the URL or head back to the store.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg border border-brand bg-brand px-6 py-3 font-mono text-sm text-background transition-colors hover:bg-brand/90"
      >
        back to the store
      </Link>
    </main>
  )
}
