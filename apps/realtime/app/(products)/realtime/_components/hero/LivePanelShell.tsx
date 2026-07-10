'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { LIVE_PEERS, SHELL_TIMING } from './variants/livePanel.data'

function PeerAvatar({ initials, label, index }: { initials: string; label: string; index: number }) {
  return (
    <motion.div
      layout
      className="avatar-fill-header relative flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-medium text-foreground"
      style={{ zIndex: -index }}
      title={label}
    >
      {initials}
    </motion.div>
  )
}

function YouAvatar({ index }: { index: number }) {
  return (
    <motion.div
      layout
      className="avatar-fill-header relative flex h-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[9px] font-medium text-foreground"
      style={{ zIndex: -index }}
      initial={{ opacity: 0, scale: 0.5, width: 0 }}
      animate={{ opacity: 1, scale: 1, width: 24 }}
      exit={{ opacity: 0, scale: 0.5, width: 0 }}
      transition={{ type: 'spring', duration: 0.47, bounce: 0 }}
      title="You"
    >
      You
    </motion.div>
  )
}

export function LivePanelShell({
  channel,
  youPresent,
  children,
}: {
  channel: string
  youPresent: boolean
  children: React.ReactNode
}) {
  const reducedMotion = useReducedMotion() ?? false
  const [latencyMs, setLatencyMs] = useState(6)

  useEffect(() => {
    if (reducedMotion) return
    const id = setInterval(() => {
      setLatencyMs(4 + Math.floor(Math.random() * 6))
    }, SHELL_TIMING.latencySample)
    return () => clearInterval(id)
  }, [reducedMotion])

  return (
    <div className="relative w-full max-w-3xl">
      {/* Faint brand glow gives the panel depth without shouting */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 50% 45%, hsl(var(--brand-default)/0.07), transparent 70%)',
        }}
      />

      <div className="overflow-hidden rounded-lg border border-border bg-surface-75 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
        <div className="flex items-center justify-between border-b border-border bg-surface-100 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {/* Channel glyph */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0 text-foreground-muted"
              aria-hidden
            >
              <path
                d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="truncate font-mono text-[11px] text-foreground-light">{channel}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-foreground-light">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              <span className="font-mono tabular-nums">Live · {latencyMs}ms</span>
            </div>

            <div className="relative isolate flex -space-x-0.5">
              <AnimatePresence mode="popLayout">
                {LIVE_PEERS.map((peer, i) => (
                  <PeerAvatar key={peer.name} initials={peer.initials} label={peer.name} index={i} />
                ))}
                {youPresent && <YouAvatar key="you" index={LIVE_PEERS.length} />}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="relative h-[280px] sm:h-[320px]">{children}</div>
      </div>
    </div>
  )
}
