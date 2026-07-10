import Link from 'next/link'
import { Button } from 'ui'

import { LivePanel } from './LivePanel'

export function LiveHero() {
  return (
    <div className="section-container py-20 lg:py-24">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col items-start text-left">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl text-foreground sm:text-5xl sm:leading-none">
              <span className="block">Realtime</span>
              <span className="block text-foreground-lighter">sync in milliseconds</span>
            </h1>

            <p className="max-w-xl text-sm text-foreground-lighter lg:text-base">
              Sync client state globally over WebSockets. Listen to database changes, store user
              presence, and broadcast messages to all connected clients.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-start gap-2">
            <Button asChild size="medium">
              <Link href="https://supabase.com/dashboard">Start your project</Link>
            </Button>
            <Button asChild size="medium" variant="default">
              <Link href="/docs/guides/realtime">Documentation</Link>
            </Button>
          </div>
        </div>

        <LivePanel />
      </div>
    </div>
  )
}
