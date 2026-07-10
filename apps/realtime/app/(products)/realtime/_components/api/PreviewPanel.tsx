'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { BroadcastPreview, DatabasePreview, PresencePreview, type LogFn } from './previews'

type ConsoleLine = { id: number; text: string }

const MAX_LINES = 4

export function PreviewPanel({ channel, active }: { channel: string; active: boolean }) {
  const [lines, setLines] = useState<ConsoleLine[]>([])
  const lineId = useRef(0)

  // The outgoing preview stays mounted while AnimatePresence plays its exit
  // animation, so its intervals can still fire after a tab switch. Each preview
  // gets a log scoped to its own channel; logs from a channel that is no longer
  // active are dropped instead of leaking into the new tab's console.
  const channelRef = useRef(channel)

  const logFor = useCallback((forChannel: string): LogFn => {
    return (text) => {
      if (channelRef.current !== forChannel) return
      setLines((prev) => [...prev.slice(-(MAX_LINES - 1)), { id: ++lineId.current, text }])
    }
  }, [])

  const dbLog = useMemo(() => logFor('db-changes'), [logFor])
  const presenceLog = useMemo(() => logFor('online-users'), [logFor])
  const broadcastLog = useMemo(() => logFor('cursor-pos'), [logFor])

  useEffect(() => {
    channelRef.current = channel
    setLines([])
  }, [channel])

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-md border border-border bg-surface-75">
      {/* Toolbar */}
      <div className="flex items-center border-b border-border bg-surface-100 px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-foreground-light">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
          </span>
          <span className="font-mono">channel: {channel}</span>
        </div>
      </div>

      {/* Live result */}
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={channel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15, delay: 0.05 } }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
            className="absolute inset-0"
          >
            {channel === 'db-changes' && <DatabasePreview log={dbLog} active={active} />}
            {channel === 'online-users' && <PresencePreview log={presenceLog} active={active} />}
            {channel === 'cursor-pos' && <BroadcastPreview log={broadcastLog} active={active} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Console strip — echoes the code's console.log. Clipped with a top
          fade mask so old lines dissolve upward instead of escaping the strip */}
      <div className="h-[96px] shrink-0 overflow-hidden border-t border-border bg-background px-4 font-mono text-[11px]">
        <div
          className="flex h-full flex-col justify-end gap-1 pb-3"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
          }}
        >
          <AnimatePresence initial={false}>
            {lines.map((line, i) => (
              <motion.div
                key={line.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
                className={
                  i === lines.length - 1 ? 'text-foreground-light' : 'text-foreground-muted'
                }
              >
                <span className="mr-2 select-none text-foreground-muted">›</span>
                {line.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {lines.length === 0 && (
            <span className="text-foreground-muted opacity-60">› waiting for events…</span>
          )}
        </div>
      </div>
    </div>
  )
}
