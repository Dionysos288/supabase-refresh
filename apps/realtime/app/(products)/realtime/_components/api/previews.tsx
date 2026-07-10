'use client'

/* ─────────────────────────────────────────────────────────
 * API PREVIEWS STORYBOARD
 *
 * Each preview is the visible result of the code panel and
 * echoes the code's console.log into the console strip.
 *
 *  db-changes    row inserts every 2.5s → green flash →
 *                log `New message: "..."`
 *  online-users  a user joins/leaves every 2.6s →
 *                log `Online users: N`
 *  cursor-pos    remote cursor springs to a new point every
 *                1.6s → log `Cursor position: { x, y }`
 * ───────────────────────────────────────────────────────── */

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from 'ui'

import { CursorArrow } from '../CursorArrow'

const TIMING = {
  dbInsert: 2500, // ms between row inserts
  presenceChurn: 2600, // ms between joins/leaves
  cursorHop: 1600, // ms between cursor moves
  flashClear: 700, // ms the insert flash stays
}

export type LogFn = (text: string) => void

/* ── Database changes ──────────────────────────────────── */

const DB_MESSAGES = [
  'Deploy is live',
  'Nice, testing now',
  'All checks passed',
  'Shipping the blog post',
  'Metrics look great',
]

type Row = { id: number; text: string }

export function DatabasePreview({ log, active }: { log: LogFn; active: boolean }) {
  const [rows, setRows] = useState<Row[]>([
    { id: 41, text: 'Kicking off the launch' },
    { id: 42, text: 'Docs are updated' },
  ])
  const [flashId, setFlashId] = useState<number | null>(null)
  const idx = useRef(0)
  const nextId = useRef(42)

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      const text = DB_MESSAGES[idx.current % DB_MESSAGES.length]
      idx.current++
      const row = { id: ++nextId.current, text }
      setRows((prev) => [...prev.slice(-3), row])
      setFlashId(row.id)
      log(`New message: "${text}"`)
      setTimeout(() => setFlashId(null), TIMING.flashClear)
    }, TIMING.dbInsert)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-[320px] overflow-hidden rounded-md border border-border bg-surface-100">
        <div className="flex border-b border-border bg-surface-200 text-[11px] text-foreground-light">
          <span className="w-14 border-r border-border px-3 py-1.5">id</span>
          <span className="flex-1 px-3 py-1.5">text</span>
        </div>
        {/* Conveyor: the outgoing row collapses while the incoming row grows,
            so the list slides in one continuous motion with stable height */}
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <motion.div
              key={row.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.45, bounce: 0 }}
              className="overflow-hidden last:[&>div]:border-b-0"
            >
              <div
                className={cn(
                  'flex border-b border-border text-xs text-foreground transition-colors duration-500',
                  flashId === row.id ? 'bg-brand/15 dark:bg-brand/10' : 'bg-transparent'
                )}
              >
                <span className="w-14 border-r border-border px-3 py-1.5 text-foreground-muted">
                  {row.id}
                </span>
                <span className="flex-1 truncate px-3 py-1.5">{row.text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Presence ──────────────────────────────────────────── */

const PRESENCE_POOL = ['AW', 'JS', 'CP', 'TP', 'IS', 'PC']

export function PresencePreview({ log, active }: { log: LogFn; active: boolean }) {
  const [online, setOnline] = useState<string[]>(PRESENCE_POOL.slice(0, 3))
  // Computed outside the setState updater: the random churn logic is impure,
  // and React double-invokes updaters in dev, desyncing the log from the state
  const onlineRef = useRef(PRESENCE_POOL.slice(0, 3))

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      const prev = onlineRef.current
      const offline = PRESENCE_POOL.filter((u) => !prev.includes(u))
      const shouldAdd =
        offline.length > 0 && (prev.length <= 2 || (prev.length < 5 && Math.random() > 0.5))
      const next = shouldAdd
        ? [...prev, offline[Math.floor(Math.random() * offline.length)]]
        : prev.filter((_, i) => i !== Math.floor(Math.random() * prev.length))
      onlineRef.current = next
      setOnline(next)
      log(`Online users: ${next.length}`)
    }, TIMING.presenceChurn)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <div className="relative isolate flex -space-x-0.5">
        <AnimatePresence mode="popLayout">
          {online.map((initials, i) => (
            <motion.div
              key={initials}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
              className="avatar-fill relative flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-medium text-foreground"
              style={{ zIndex: -i }}
            >
              {initials}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <motion.span
        key={online.length}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs tabular-nums text-foreground-light"
      >
        {online.length} online now
      </motion.span>
    </div>
  )
}

/* ── Broadcast ─────────────────────────────────────────── */

export function BroadcastPreview({ log, active }: { log: LogFn; active: boolean }) {
  const [target, setTarget] = useState({ x: 40, y: 45, px: 160, py: 135 })

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      const x = Math.round(15 + Math.random() * 70)
      const y = Math.round(20 + Math.random() * 60)
      // px/py are the "payload" coordinates — shown on the cursor label AND
      // logged to the console so canvas and console are visibly the same event
      const next = { x, y, px: x * 4, py: y * 3 }
      setTarget(next)
      log(`Cursor position: { x: ${next.px}, y: ${next.py} }`)
    }, TIMING.cursorHop)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--foreground-muted)/0.35) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 100%)',
        }}
      />
      <motion.div
        className="absolute"
        animate={{ left: `${target.x}%`, top: `${target.y}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <CursorArrow color="#3ECF8E" size={22} />
        <motion.span
          key={`${target.px}-${target.py}`}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute left-[13px] top-[19px] rounded bg-brand px-1.5 py-0.5 font-mono text-[9px] font-medium text-white shadow-sm whitespace-nowrap"
        >
          {`{ x: ${target.px}, y: ${target.py} }`}
        </motion.span>
      </motion.div>
    </div>
  )
}
